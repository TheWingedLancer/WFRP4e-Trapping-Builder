// ===========================================================================
// Item Factory – Creates FoundryVTT Item documents from parsed AI data
// ===========================================================================
import { resolveIcon } from "./icon-resolver.mjs";

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
 * Create a world-level Item from parsed AI data.
 * @param {object} itemData - Parsed item data from AI
 * @returns {Promise<Item>} The created Item document
 */
export async function createWorldItem(itemData) {
  await _resolveItemIcon(itemData);
  const { effects, ...coreData } = itemData;
  const item = await Item.create(coreData);

  if (effects?.length) {
    await _createEffects(item, effects);
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
  const { effects, ...coreData } = itemData;
  const [item] = await actor.createEmbeddedDocuments("Item", [coreData]);

  if (effects?.length) {
    await _createEffects(item, effects);
  }

  return item;
}

/**
 * Create ActiveEffects on an item from the AI-generated effect data.
 * Handles WFRP4e-specific scriptData and transferData structures.
 */
async function _createEffects(item, effectsData) {
  const effectDocs = effectsData.map((efData) => {
    const effectObj = {
      name: efData.name ?? "Effect",
      icon: efData.icon ?? item.img ?? "icons/svg/aura.svg",
      transfer: efData.transfer ?? true,
      disabled: efData.disabled ?? false,
      flags: efData.flags ?? {},
    };

    // Standard Foundry changes array (characteristic modifiers, movement, etc.)
    if (efData.changes?.length) {
      effectObj.changes = efData.changes;
    }

    // Duration (rounds for temporary effects)
    if (efData.duration) {
      effectObj.duration = efData.duration;
    }

    // WFRP4e V8+ stores script/transfer data in effect.system
    if (efData.system) {
      effectObj.system = efData.system;
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
      summary.effects.push({
        name: ef.name,
        trigger: scripts.map((s) => s.trigger).join(", ") || "passive",
        scriptCount: scripts.length,
        scripts: scripts.map((s) => ({
          label: s.label ?? "Script",
          trigger: s.trigger,
          preview: _truncateScript(s.script),
        })),
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
