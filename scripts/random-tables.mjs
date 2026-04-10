// ===========================================================================
// Random Tables – Magical Weapon & Armour Qualities + Armour Size
// From Archives of the Empire Vol II
// ===========================================================================

/**
 * Roll a d100 (1-100)
 */
function d100() {
  return Math.floor(Math.random() * 100) + 1;
}

/**
 * Roll a dN
 */
function dN(n) {
  return Math.floor(Math.random() * n) + 1;
}

// ---------------------------------------------------------------------------
// MAGICAL WEAPON QUALITIES (d100) — Archives of the Empire Vol II, p58-60
// ---------------------------------------------------------------------------
const MAGICAL_WEAPON_TABLE = [
  { range: [1, 20], name: "Touched by the Winds",
    description: "The weapon has petty enchantments cast upon it. Beyond damaging creatures immune to non-magical attacks it has no particular ability. If ranged, this applies to its ammunition.",
    effects: [] },
  { range: [21, 24], name: "Wreathed in Shadow",
    description: "The blade seems insubstantial and ghostly. Any target hit by the weapon receives no benefit from non-magical armour.",
    effects: [] },
  { range: [25, 28], name: "Alight with Flame",
    description: "Once drawn the weapon bursts into searing flame. If the wielder hits a flammable target, the target suffers one Ablaze Condition.",
    effects: [] },
  { range: [29, 31], name: "Hoarfrost Blade",
    description: "The weapon is supernaturally cold. Any target hit suffers a Stunned Condition in addition to other effects.",
    effects: [] },
  { range: [32, 34], name: "Crackling with Lightning",
    description: "The weapon crackles with arcs of electricity. The weapon has the Damaging Quality and inflicts one additional Wound on any hit.",
    qualities: [{"name":"damaging"}] },
  { range: [35, 37], name: "Of the Righteous",
    description: "A weapon imbued with sacred power. The wielder gains +10 to WS or BS and the weapon gains the Impale Quality.",
    qualities: [{"name":"impale"}] },
  { range: [38, 40], name: "Of Venomous Spite",
    description: "The weapon drips with a magical venom. Any target wounded by the weapon must pass an Average (+20) Endurance Test or gain the Poisoned Condition.",
    effects: [] },
  { range: [41, 43], name: "Spirit-Binding",
    description: "The weapon is bound with a minor spirit. The wielder may reroll one failed attack per combat round.",
    effects: [] },
  { range: [44, 46], name: "Of Sudden Swiftness",
    description: "Enchantments allow the wielder to strike with preternatural speed. The weapon gains the Fast Quality and the wielder gains +1 Initiative.",
    qualities: [{"name":"fast"}] },
  { range: [47, 49], name: "Of Sureness",
    description: "The weapon is enchanted to fly true. The wielder benefits from the Talents: Accurate Shot, Sharpshooter, and Sniper.",
    effects: [] },
  { range: [50, 51], name: "Of Might",
    description: "The wielder's attacks are imbued with tremendous force. The weapon has the Impact Quality.",
    qualities: [{"name":"impact"}] },
  { range: [52, 54], name: "Of Stalwart Sorcery",
    description: "These weapons strike true. The weapon has the Precise Quality.",
    qualities: [{"name":"precise"}] },
  { range: [55, 57], name: "Bewildering",
    description: "Powerful enchantments of bemusement and misdirection. Anyone wounded by the weapon gains the Surprised Condition.",
    effects: [] },
  { range: [58, 60], name: "Of Bold Brass",
    description: "The weapon's bearer is filled with vim, is immune to Fear, and enjoys +2 SL bonus to resist Terror.",
    effects: [] },
  { range: [61, 63], name: "Of the Wolf's Wide Jaws",
    description: "Favoured Ulrican weapons with wolf motifs. The weapon has the Damaging Quality.",
    qualities: [{"name":"damaging"}] },
  { range: [64, 66], name: "Of Deft and Cunning",
    description: "Often created with Myrmidian experts. The wielder benefits from +20 WS or BS, as appropriate.",
    effects: [] },
  { range: [67, 69], name: "Of Salt and Brine",
    description: "Blessed by priests of Manann. The bearer may make a free Action in the first Round of any combat. The weapon also has the Fast Quality.",
    qualities: [{"name":"fast"}] },
  { range: [70, 72], name: "Of Grisly Wounds",
    description: "Deathly enchantments ensure that wounds are severe. The weapon has the Damaging Quality.",
    qualities: [{"name":"damaging"}] },
  { range: [73, 75], name: "Of Tooth and Claw",
    description: "Creatures with the Bestial Trait recognise something of themselves in this weapon. Creatures with the Bestial Trait are subject to Fear (1) when the weapon is drawn.",
    effects: [] },
  { range: [76, 78], name: "Of Enduring War",
    description: "The weapon is remarkably hard to destroy. It has the Unbreakable Quality.",
    qualities: [{"name":"unbreakable"}] },
  { range: [79, 81], name: "Of the Mage-Hunter",
    description: "These weapons are the bane of spellcasters. If the weapon wounds a spellcaster, the target must pass a Hard (-20) Willpower Test or be unable to cast spells for 1d10 rounds.",
    effects: [] },
  { range: [82, 84], name: "Of Festering Wounds",
    description: "All Wounds the weapon inflicts are Festering Wounds.",
    effects: [] },
  { range: [85, 87], name: "Of Keenest Edge",
    description: "The tip and edges are kept magically keen. The weapon has the Hack, Impale, and Penetrating Qualities.",
    qualities: [{"name":"hack"},{"name":"impale"},{"name":"penetrating"}] },
  { range: [88, 90], name: "Of Bane",
    description: "Made with enchantments that increase deadliness to a given enemy. If it deals damage to a particular type of creature, it inflicts twice the number of Wounds. Roll on the Random Creature Table to determine the affected creature.",
    effects: [] },
  { range: [91, 92], name: "Of Ceaseless Cleaving",
    description: "Powerful enchantments guide the weapon through flesh and bone. If a hit deals Damage, it inflicts an additional two Wounds.",
    effects: [] },
  { range: [93, 94], name: "Of Leaping Gold",
    description: "Handles like a feather, lands like a block of lead. The weapon has the Fast, Penetrating, and Precise Qualities.",
    qualities: [{"name":"fast"},{"name":"penetrating"},{"name":"precise"}] },
  { range: [95, 96], name: "Of Grievous Injury",
    description: "Injuries inflicted by this weapon are cruel and severe. All Critical Wounds caused by this weapon have +20 added to the result.",
    effects: [] },
  { range: [97, 98], name: "Of Spell-Eating",
    description: "The weapon absorbs magical energy. The wielder gains the Magic Resistance Talent at the appropriate level.",
    effects: [] },
  { range: [99, 100], name: "Artefact of Power",
    description: "This is a truly mighty weapon. Roll twice more on this table and combine the results. If this result is rolled again, the weapon has three abilities.",
    effects: [], reroll: 2 },
];

// ---------------------------------------------------------------------------
// MAGICAL ARMOUR QUALITIES (d100) — Archives of the Empire Vol II, p62-65
// ---------------------------------------------------------------------------
const MAGICAL_ARMOUR_TABLE = [
  { range: [1, 32], name: "Magical Armour",
    description: "The armour is enchanted, but has no unusual ability beyond protecting against attacks that ignore non-magical armour.",
    effects: [] },
  { range: [33, 38], name: "Gromril Armour",
    description: "The armour is made of Gromril, and enjoys all the benefits of that material. It bears Runes identifying the Dwarf Hold to which the suit belongs by right.",
    effects: [], material: "gromril" },
  { range: [39, 42], name: "Ithilmar Armour",
    description: "The armour is made of Ithilmar, and enjoys all the benefits of that material. Eltharin inscription identifies its original owner.",
    effects: [], material: "ithilmar" },
  { range: [43, 44], name: "Gifted Armour",
    description: "One of the very rare suits of Gromril or Ithilmar armour made as a gift, sized suitably for a non-Dwarf or non-Elf recipient.",
    effects: [] },
  { range: [45, 56], name: "Warded Armour",
    description: "Protective sigils are etched into the armour. The wearer ignores the first Critical Hit they receive each day.",
    effects: [] },
  { range: [57, 64], name: "Spectral Armour",
    description: "The armour is partially translucent and seems to shimmer. Opponents in melee suffer -10 WS when attacking the wearer.",
    effects: [] },
  { range: [65, 76], name: "Dazzling Armour",
    description: "In daylight or near a strong light source, opponents in melee with the wearer must pass an Average (+20) Agility Test at the start of each Round or suffer one Blinded Condition. Full suit required.",
    effects: [] },
  { range: [77, 88], name: "Trickster's Armour",
    description: "Artificers consulted with followers of Ranald to imbue the armour with protective wards. If an attack hits an area protected by this armour, roll 1d10. On a roll of a 10, the wearer ignores the hit.",
    effects: [] },
  { range: [89, 96], name: "Armour of Resilience",
    description: "Powerful enchantments of Chamon ensure that the living flesh of the wearer is as strong as steel. The wearer benefits from +5 Toughness. Full suit required.",
    effects: [] },
  { range: [97, 99], name: "Armour of Fortune",
    description: "The Armour of Fortune misdirects blows that would otherwise land. If an attack hits an area protected by this armour, roll 1d10. On a roll of a 9 or 10, the wearer ignores the hit.",
    effects: [] },
  { range: [100, 100], name: "Legendary Armour",
    description: "This is truly legendary armour. Roll twice more on this table. Maximum of five abilities; duplicates are not cumulative.",
    effects: [], reroll: 2 },
];

// ---------------------------------------------------------------------------
// MAGICAL SHIELD QUALITIES (d100) — Archives of the Empire Vol II, p64
// ---------------------------------------------------------------------------
const MAGICAL_SHIELD_TABLE = [
  { range: [1, 45], name: "Magical Shield",
    description: "The shield is magical, but has no further ability beyond protecting against attacks that ignore non-magical armour.",
    effects: [] },
  { range: [46, 56], name: "Ithilmar Shield",
    description: "These shields are very light. Reduce Encumbrance by 1 to a minimum of 0.",
    effects: [] },
  { range: [57, 68], name: "Gromril Shield",
    description: "Gromril shields provide +1 to the Shield Quality. So, a large Gromril shield counts as having the Shield 4 Quality.",
    effects: [] },
  { range: [69, 75], name: "Shield of Ptolos",
    description: "Enchantments misdirect projectiles. Shields of Ptolos provide +2 to the Shield Quality when defending against a missile weapon.",
    effects: [] },
  { range: [76, 88], name: "Spell Shield",
    description: "Enchanted to deflect magic missiles. The bearer may attempt to dispel any magic missile spell that targets them, using Language (Magick) Skill of 30.",
    effects: [] },
  { range: [89, 100], name: "Charmed Shield",
    description: "Enchantments imbue this shield with an enhanced ability to deflect incoming attacks. The bearer benefits from +3 SL to Melee Tests they make when opposing incoming attacks.",
    effects: [] },
];

// ---------------------------------------------------------------------------
// ARMOUR PIECE TABLE (d100) — Archives of the Empire Vol II, p62
// ---------------------------------------------------------------------------
const ARMOUR_PIECE_TABLE = [
  { range: [1, 3], piece: "Mail Chausses", material: "mail", coverage: "legs" },
  { range: [4, 10], piece: "Mail Coat", material: "mail", coverage: "body+arms" },
  { range: [11, 15], piece: "Mail Coif", material: "mail", coverage: "head" },
  { range: [16, 20], piece: "Mail Shirt", material: "mail", coverage: "body" },
  { range: [21, 25], piece: "Mail Coat and Chausses", material: "mail", coverage: "body+arms+legs" },
  { range: [26, 35], piece: "Mail Coat, Chausses, and Coif", material: "mail", coverage: "full" },
  { range: [36, 38], piece: "Leather Jack", material: "leather", coverage: "body+arms" },
  { range: [39, 41], piece: "Leather Jerkin", material: "leather", coverage: "body" },
  { range: [42, 45], piece: "Leather Leggings", material: "leather", coverage: "legs" },
  { range: [46, 48], piece: "Leather Skullcap", material: "leather", coverage: "head" },
  { range: [49, 51], piece: "Leather Breastplate", material: "boiled_leather", coverage: "body" },
  { range: [52, 54], piece: "Full Leather Armour", material: "leather", coverage: "full" },
  { range: [55, 70], piece: "Plate Breastplate", material: "plate", coverage: "body" },
  { range: [71, 75], piece: "Plate Open Helm", material: "plate", coverage: "head" },
  { range: [76, 80], piece: "Plate Bracers", material: "plate", coverage: "arms" },
  { range: [81, 85], piece: "Plate Leggings", material: "plate", coverage: "legs" },
  { range: [86, 90], piece: "Plate Helm", material: "plate", coverage: "head" },
  { range: [91, 100], piece: "Full Plate Armour", material: "plate", coverage: "full" },
];

// ---------------------------------------------------------------------------
// ARMOUR SIZE TABLE (d10) — Archives of the Empire Vol II, p62
// Determines the species and height of the armour's original intended wearer.
// ---------------------------------------------------------------------------
const ARMOUR_SIZE_TABLE = [
  { roll: 1, species: "Human", height: "Exceedingly Short" },
  { roll: 2, species: "Human", height: "Short" },
  { roll: 3, species: "Human", height: "Short" },
  { roll: 4, species: "Human", height: "Average" },
  { roll: 5, species: "Human", height: "Average" },
  { roll: 6, species: "Elf", height: "Average" },
  { roll: 7, species: "Elf", height: "Average" },
  { roll: 8, species: "Dwarf", height: "Tall" },
  { roll: 9, species: "Dwarf", height: "Tall" },
  { roll: 10, species: "Halfling", height: "Exceedingly Tall" },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a result from a table by d100 roll.
 */
function _lookup(table, roll) {
  return table.find((entry) => roll >= entry.range[0] && roll <= entry.range[1]);
}

/**
 * Roll on the Magical Weapon Qualities table.
 * Returns an object with the roll, name, description, and any qualities to add.
 * Handles "Artefact of Power" rerolls.
 */
export function rollMagicalWeaponQuality() {
  const results = [];
  let rolls = 1;

  while (rolls > 0) {
    rolls--;
    const roll = d100();
    const entry = _lookup(MAGICAL_WEAPON_TABLE, roll);
    if (!entry) continue;

    if (entry.reroll) {
      rolls += entry.reroll;
      results.push({ roll, name: entry.name, description: entry.description, note: `Roll ${entry.reroll} more times!` });
    } else {
      results.push({
        roll,
        name: entry.name,
        description: entry.description,
        qualities: entry.qualities ?? [],
      });
    }
  }

  return results;
}

/**
 * Roll on the Magical Armour Qualities table.
 */
export function rollMagicalArmourQuality() {
  const results = [];
  let rolls = 1;

  while (rolls > 0) {
    rolls--;
    const roll = d100();
    const entry = _lookup(MAGICAL_ARMOUR_TABLE, roll);
    if (!entry) continue;

    if (entry.reroll) {
      rolls += entry.reroll;
      results.push({ roll, name: entry.name, description: entry.description, note: `Roll ${entry.reroll} more times!` });
    } else {
      results.push({
        roll,
        name: entry.name,
        description: entry.description,
        qualities: entry.qualities ?? [],
      });
    }
  }

  return results;
}

/**
 * Roll on the Magical Shield Qualities table.
 */
export function rollMagicalShieldQuality() {
  const roll = d100();
  const entry = _lookup(MAGICAL_SHIELD_TABLE, roll);
  return entry ? { roll, ...entry } : null;
}

/**
 * Roll random armour piece (which piece) from the canonical table.
 */
export function rollRandomArmour() {
  const pieceRoll = d100();
  const piece = _lookup(ARMOUR_PIECE_TABLE, pieceRoll);

  // Roll size (species + height) using d10
  const speciesRoll = dN(10);
  const heightRoll = dN(10);
  const species = ARMOUR_SIZE_TABLE.find((e) => e.roll === speciesRoll);
  const height = ARMOUR_SIZE_TABLE.find((e) => e.roll === heightRoll);

  return {
    pieceRoll,
    piece: piece?.piece ?? "Plate Breastplate",
    material: piece?.material ?? "plate",
    coverage: piece?.coverage ?? "body",
    speciesRoll,
    species: species?.species ?? "Human",
    heightRoll,
    height: height?.height ?? "Average",
  };
}
