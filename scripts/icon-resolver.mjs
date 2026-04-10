// ===========================================================================
// Icon Resolver – Finds the best WFRP4e icon for a generated item
//
// Strategy:
//   1. Search WFRP4e compendium items for a name/type match → use that icon
//   2. Fall back to a keyword-based lookup against cached compendium icons
//   3. Last resort: use Foundry's built-in generic icons
// ===========================================================================

const MODULE_ID = "wfrp4e-trapping-builder";

/** Cache of compendium icons, built once on first use */
let _iconCache = null;

/**
 * Build the icon cache from all Item compendium packs.
 * Groups icons by item type and stores name → icon path mappings.
 */
async function _buildIconCache() {
  if (_iconCache) return _iconCache;

  _iconCache = {
    byName: new Map(),    // lowercase item name → icon path
    byType: {},           // item type → [{name, img, keywords}]
  };

  const packs = game.packs.filter((p) => p.metadata.type === "Item");

  for (const pack of packs) {
    let index;
    try {
      // Use the index which is much faster than getDocuments
      index = await pack.getIndex({ fields: ["name", "type", "img"] });
    } catch {
      continue;
    }

    for (const entry of index) {
      if (!entry.img || entry.img.endsWith("blank.png") || entry.img === "icons/svg/item-bag.svg") continue;

      const nameLower = entry.name?.toLowerCase() ?? "";
      _iconCache.byName.set(nameLower, entry.img);

      const type = entry.type;
      if (!_iconCache.byType[type]) _iconCache.byType[type] = [];
      _iconCache.byType[type].push({
        name: nameLower,
        img: entry.img,
        keywords: nameLower.split(/[\s,()-]+/).filter(Boolean),
      });
    }
  }

  console.log(`${MODULE_ID} | Icon cache built: ${_iconCache.byName.size} items indexed`);
  return _iconCache;
}

/**
 * Resolve the best icon for a generated item.
 * @param {object} itemData - The parsed item data from AI
 * @returns {Promise<string>} The best icon path found
 */
export async function resolveIcon(itemData) {
  const cache = await _buildIconCache();
  const name = (itemData.name ?? "").toLowerCase();
  const type = itemData.type ?? "trapping";

  // 1. Exact name match in compendium
  if (cache.byName.has(name)) {
    return cache.byName.get(name);
  }

  // 2. Fuzzy name match — find compendium item with most keyword overlap
  const nameKeywords = name.split(/[\s,()-]+/).filter((w) => w.length > 2);
  const typeEntries = cache.byType[type] ?? [];

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of typeEntries) {
    let score = 0;
    for (const kw of nameKeywords) {
      if (entry.keywords.some((ek) => ek.includes(kw) || kw.includes(ek))) {
        score += 1;
      }
    }
    // Bonus for exact substring match
    if (entry.name.includes(name) || name.includes(entry.name)) {
      score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry.img;
    }
  }

  if (bestMatch && bestScore >= 1) {
    return bestMatch;
  }

  // 3. Keyword-based search across ALL types (the item might be a weapon
  //    but named like a trapping, etc.)
  const allEntries = Object.values(cache.byType).flat();
  bestMatch = null;
  bestScore = 0;

  for (const entry of allEntries) {
    let score = 0;
    for (const kw of nameKeywords) {
      if (entry.keywords.some((ek) => ek.includes(kw) || kw.includes(ek))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry.img;
    }
  }

  if (bestMatch && bestScore >= 1) {
    return bestMatch;
  }

  // 4. Type-based generic fallback from compendium (pick first icon for this type)
  if (typeEntries.length > 0) {
    // Pick the most "generic" looking one — shortest name tends to be the base item
    const sorted = [...typeEntries].sort((a, b) => a.name.length - b.name.length);
    return sorted[0].img;
  }

  // 5. Last resort: Foundry built-in icons
  return _builtinFallback(type, itemData);
}

/**
 * Foundry built-in icon fallbacks by item type and subtype.
 */
function _builtinFallback(type, itemData) {
  const trappingType = itemData.system?.trappingType?.value;
  const weaponGroup = itemData.system?.weaponGroup?.value;

  switch (type) {
    case "weapon":
      if (["bow", "longbow"].some((w) => weaponGroup?.includes(w))) return "icons/weapons/bows/longbow-leather-green.webp";
      if (weaponGroup === "crossbow") return "icons/weapons/crossbows/crossbow-simple-brown.webp";
      if (weaponGroup === "blackpowder") return "icons/weapons/guns/gun-flintlock-brown.webp";
      if (weaponGroup === "twohanded") return "icons/weapons/swords/greatsword-guard-steel.webp";
      if (weaponGroup === "polearm") return "icons/weapons/polearms/halberd-crescent-steel.webp";
      if (weaponGroup === "fencing") return "icons/weapons/swords/sword-guard-bronze-long.webp";
      if (weaponGroup === "flail") return "icons/weapons/maces/flail-ball-grey.webp";
      return "icons/weapons/swords/sword-guard-steel.webp";

    case "armour":
      return "icons/equipment/chest/breastplate-steel-grey.webp";

    case "ammunition":
      return "icons/weapons/ammunition/arrows-flight-red.webp";

    case "container":
      return "icons/containers/bags/pack-leather-brown.webp";

    case "money":
      return "icons/commodities/currency/coins-plain-stack-gold.webp";

    case "trapping":
      switch (trappingType) {
        case "foodAndDrink": return "icons/consumables/food/bowl-stew-brown.webp";
        case "drugsPoisonsHerbsDraughts": return "icons/consumables/potions/potion-flask-corked-green.webp";
        case "toolsAndKits": return "icons/tools/laboratory/vials-blue.webp";
        case "booksAndDocuments": return "icons/sundries/books/book-clasp-brown-red.webp";
        case "clothingAccessories": return "icons/equipment/chest/coat-collared-brown.webp";
        default: return "icons/sundries/misc/trinkets-colored.webp";
      }

    default:
      return "icons/sundries/misc/trinkets-colored.webp";
  }
}
