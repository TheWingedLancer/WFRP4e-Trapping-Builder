// ===========================================================================
// Item Factory – Creates FoundryVTT Item documents from parsed AI data
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
    if (icon) itemData.img = icon;
  } catch (e) {
    console.warn("Trapping Builder | Icon resolution failed, keeping AI suggestion:", e);
  }
}

/**
 * Check if the raw itemData represents a consumable.
 */
function _isConsumable(itemData) {
  return !!itemData.flags?.[CONSUMABLE_MODULE_ID]?.isConsumable;
}

/**
 * Create a world-level Item from parsed AI data.
 * @param {object} itemData - Parsed item data from AI
 * @returns {Promise<Item>} The created Item document
 */
export async function createWorldItem(itemData) {
  await _resolveItemIcon(itemData);
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
 * @param {Actor} actor - Target actor
 * @param {object} itemData - Parsed item data from AI
 * @returns {Promise<Item>} The created owned Item
 */
export async function createActorItem(actor, itemData) {
  await _resolveItemIcon(itemData);
  const consumable = _isConsumable(itemData);
  const { effects, ...coreData } = itemData;
  const [item] = await actor.createEmbeddedDocuments("Item", [coreData]);

  if (effects?.length) {
    await _createEffects(item, effects, consumable);
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
      icon: itemIcon,
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
      // - Do NOT include system.transferData (causes WFRP4e to auto-apply)
      // - Do NOT include system.scriptData (not needed for consumables)
      // - Only include duration if the user explicitly requested timed effects
      effectObj.flags = {
        wfrp4e: { effectApplication: "actor" },
        [CONSUMABLE_MODULE_ID]: { consumableEffect: true },
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
    summary.maxAP = itemData.system?.maxAP?.value;
    summary.locations = itemData.system?.locations;
  }

  return summary;
}

function _truncateScript(script) {
  if (!script) return "";
  const clean = script.replace(/\s+/g, " ").trim();
  return clean.length > 120 ? clean.substring(0, 117) + "…" : clean;
}
