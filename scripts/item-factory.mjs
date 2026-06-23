// ===========================================================================
// Item Factory – Creates FoundryVTT Item documents from parsed AI data
//
// This module is responsible for the final step of item creation: taking
// the structured JSON data produced by the AI parser (or modified by
// random tables / rune inscription) and creating actual FoundryVTT Item
// and ActiveEffect documents.
//
// KEY RESPONSIBILITIES:
//
// 1. ICON RESOLUTION
//    Replaces the AI's suggested icon path with a real icon from the
//    WFRP4e compendium. Falls back to guaranteed Foundry SVG icons to
//    avoid 404 errors on Forge-hosted instances.
//
// 2. MAGICAL QUALITY ENFORCEMENT
//    Safety net that scans item name/description for magical keywords
//    and ensures the WFRP4e "magical" quality is present on weapons
//    and armour. This catches cases where the AI omits it.
//
// 3. WORLD ITEM CREATION (createWorldItem)
//    Creates a standalone Item in the world Items directory. Effects
//    are created as embedded ActiveEffect documents after the item.
//
// 4. ACTOR ITEM CREATION (createActorItem)
//    Creates an owned Item directly on an Actor's inventory.
//    For consumables: uses a staging world item to properly serialize
//    embedded effects, then copies to the actor and deletes the staging item.
//    This prevents WFRP4e from auto-applying characteristic effects.
//
// 5. ACTIVE EFFECT CREATION (_createEffects)
//    Converts the effect data array into proper FoundryVTT ActiveEffect
//    documents. Handles two paths:
//    - CONSUMABLE: transfer=false, transferData.type="other" so WFRP4e
//      doesn't auto-apply. The wfrp4e-consumables-with-effects module
//      handles manual application on consume.
//    - NON-CONSUMABLE: transfer=true, equipTransfer=true so effects
//      apply when the item is equipped. Passes through scriptData for
//      WFRP4e trigger scripts (applyDamage, preTakeDamage, dialog, etc.)
//
// 6. PREVIEW SUMMARY (buildPreviewSummary)
//    Builds a template-friendly summary of the item data for the preview
//    card shown before creation. Extracts effect names, triggers, and
//    truncated script previews.
// ===========================================================================
import { resolveIcon } from "./icon-resolver.mjs";

const CONSUMABLE_MODULE_ID = "wfrp4e-consumables-with-effects";

/**
 * Resolve the best icon for the item, replacing whatever the AI suggested.
 * WFRP4e compendium icons are preferred, with Foundry built-ins as fallback.
 */
async function _resolveItemIcon(itemData) {
  try {
    const icon = await resolveIcon(itemData);
    // Always use the resolved icon — never trust the AI's suggestion
    // as it may reference paths that don't exist on Forge
    itemData.img = icon || "icons/svg/item-bag.svg";
  } catch (e) {
    console.warn("Trapping Builder | Icon resolution failed:", e);
    itemData.img = "icons/svg/item-bag.svg";
  }
}

/**
 * Check if the raw itemData represents a consumable.
 */
function _isConsumable(itemData) {
  return !!itemData.flags?.[CONSUMABLE_MODULE_ID]?.isConsumable;
}

/**
 * MAGICAL QUALITY ENFORCEMENT
 * If the item name or description contains magical keywords, ensure the
 * "magical" quality is present on weapons and armour. This is a safety net
 * in case the AI omits it.
 */
const MAGICAL_KEYWORDS = /\b(magic|magical|enchanted|enchantment|runic|rune|blessed|imbued|arcane|ensorcelled|bewitched)\b/i;

function _ensureMagicalQuality(itemData) {
  if (!["weapon", "armour"].includes(itemData.type)) return;

  const name = itemData.name ?? "";
  const desc = itemData.system?.description?.value ?? "";
  const hasMagicalKeyword = MAGICAL_KEYWORDS.test(name) || MAGICAL_KEYWORDS.test(desc);

  if (!hasMagicalKeyword) return;

  // Ensure qualities array exists
  if (!itemData.system) itemData.system = {};
  if (!itemData.system.qualities) itemData.system.qualities = { value: [] };
  if (!Array.isArray(itemData.system.qualities.value)) itemData.system.qualities.value = [];

  // Add "magical" if not already present
  const quals = itemData.system.qualities.value;
  if (!quals.some((q) => q.name === "magical")) {
    quals.push({ name: "magical" });
  }
}

/**
 * Create a world-level Item from parsed AI data.
 * @param {object} itemData - Parsed item data from AI
 * @returns {Promise<Item>} The created Item document
 */
export async function createWorldItem(itemData) {
  await _resolveItemIcon(itemData);
  _ensureMagicalQuality(itemData);
  const consumable = _isConsumable(itemData);
  const { effects, ...coreData } = itemData;
  const item = await Item.create(coreData);

  if (effects?.length) {
    await _createEffects(item, effects, consumable);
  }

  return item;
}

/**
 * Create an owned Item on an Actor from parsed AI data.
 *
 * For consumables: creates a world-level Item with the effect attached,
 * then adds a COPY of just the item data (with embedded effects) to the actor.
 * The world item is then deleted (it was just a staging area).
 *
 * For non-consumables: creates directly on the actor with effects.
 *
 * @param {Actor} actor - Target actor
 * @param {object} itemData - Parsed item data from AI
 * @returns {Promise<Item>} The created owned Item
 */
export async function createActorItem(actor, itemData) {
  await _resolveItemIcon(itemData);
  _ensureMagicalQuality(itemData);
  const consumable = _isConsumable(itemData);

  if (consumable) {
    // Build the item + effect as a world item (effects are dormant on world items)
    const worldItem = await createWorldItem(itemData);

    // Serialize the world item including its embedded effects
    const fullData = worldItem.toObject();

    // Delete the staging world item
    await worldItem.delete();

    // Create on the actor from the serialized data
    const [ownedItem] = await actor.createEmbeddedDocuments("Item", [fullData]);
    return ownedItem;
  }

  // Non-consumable: create directly on actor
  const { effects, ...coreData } = itemData;
  const [item] = await actor.createEmbeddedDocuments("Item", [coreData]);

  if (effects?.length) {
    await _createEffects(item, effects, false);
  }

  return item;
}

/**
 * Create ActiveEffects on an item from the AI-generated effect data.
 *
 * For consumables: forces transfer:false, strips ALL system/transferData/scriptData,
 * and only keeps the changes array. The consumables-with-effects module handles
 * the actual application on consume via its own consumeItem() function.
 */
async function _createEffects(item, effectsData, isConsumable) {
  const itemIcon = item.img || "icons/svg/aura.svg";

  const effectDocs = effectsData.map((efData) => {
    const effectObj = {
      name: efData.name ?? "Effect",
      img: itemIcon,
      transfer: isConsumable ? false : (efData.transfer ?? true),
      disabled: efData.disabled ?? false,
    };

    // Standard Foundry changes array (characteristic modifiers, movement, etc.)
    if (efData.changes?.length) {
      effectObj.changes = efData.changes;
    }

    if (isConsumable) {
      // CONSUMABLE PATH: The consumables-with-effects module handles everything.
      // - transfer MUST be false (set above)
      // - Set transferData.type to "other" so WFRP4e's effect engine does NOT apply it
      // - Only include duration if the user explicitly requested timed effects
      effectObj.flags = {
        [CONSUMABLE_MODULE_ID]: { consumableEffect: true },
      };
      effectObj.system = {
        transferData: {
          type: "other",
          documentType: "Actor",
          equipTransfer: false,
        },
      };
      if (efData.duration?.rounds) {
        effectObj.duration = { rounds: efData.duration.rounds };
      }
    } else {
      // NON-CONSUMABLE PATH: pass through AI-generated config
      effectObj.flags = efData.flags ?? {};

      if (efData.duration) {
        effectObj.duration = efData.duration;
      }

      if (efData.system) {
        effectObj.system = efData.system;
      }
    }

    return effectObj;
  });

  await item.createEmbeddedDocuments("ActiveEffect", effectDocs);
}

/**
 * Build a preview-friendly summary from parsed item data.
 * Used to show the GM what will be created before committing.
 */
export function buildPreviewSummary(itemData) {
  const summary = {
    name: itemData.name,
    type: itemData.type,
    description: itemData.system?.description?.value ?? "",
    effects: [],
  };

  if (itemData.effects?.length) {
    for (const ef of itemData.effects) {
      const scripts = ef.system?.scriptData ?? [];
      const changes = ef.changes ?? [];
      summary.effects.push({
        name: ef.name,
        trigger: scripts.length
          ? scripts.map((s) => s.trigger).join(", ")
          : changes.length
            ? "changes"
            : "passive",
        scriptCount: scripts.length,
        changeCount: changes.length,
        scripts: scripts.map((s) => ({
          label: s.label ?? "Script",
          trigger: s.trigger,
          preview: _truncateScript(s.script),
        })),
        changes: changes
          .filter((c) => !c.key?.includes("calculationBonusModifier"))
          .map((c) => `${c.key}: ${c.value}`),
      });
    }
  }

  // Item-type specific fields
  if (itemData.type === "weapon") {
    summary.weaponGroup = itemData.system?.weaponGroup?.value;
    summary.damage = itemData.system?.damage?.value;
    summary.reach = itemData.system?.reach?.value;
  } else if (itemData.type === "armour") {
    summary.AP = itemData.system?.AP;
    summary.locations = itemData.system?.locations;
  }

  return summary;
}

function _truncateScript(script) {
  if (!script) return "";
  const clean = script.replace(/\s+/g, " ").trim();
  return clean.length > 120 ? clean.substring(0, 117) + "…" : clean;
}
