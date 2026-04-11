// ===========================================================================
// Random Tables – Magical Weapon & Armour Qualities + Armour Size
// From Archives of the Empire Vol II (canonical d100 ranges from the PDF)
//
// Each entry includes:
//   - range: d100 range
//   - name: enchantment name
//   - description: flavour text
//   - qualities: weapon/armour qualities to add [{name, value?}]
//   - effectData: WFRP4e Active Effect data to create on the item
//     - changes: Foundry changes array for simple stat mods
//     - scriptData: WFRP4e script triggers for complex behavior
// ===========================================================================

function d100() { return Math.floor(Math.random() * 100) + 1; }
function dN(n) { return Math.floor(Math.random() * n) + 1; }

// ---------------------------------------------------------------------------
// MAGICAL WEAPON QUALITIES (d100) — Archives of the Empire Vol II, p58-60
// ---------------------------------------------------------------------------
const MAGICAL_WEAPON_TABLE = [
  { range: [1, 20], name: "Touched by the Winds",
    description: "The weapon has petty enchantments. Beyond damaging creatures immune to non-magical attacks it has no particular ability.",
    qualities: [], effectData: null },

  { range: [21, 24], name: "Wreathed in Shadow",
    description: "The blade seems insubstantial and ghostly. Any target hit receives no benefit from non-magical armour.",
    qualities: [],
    effectData: { scriptData: [{ label: "Wreathed in Shadow", trigger: "applyDamage",
      script: "if (!args.opposedTest.result.weapon?.system?.qualities?.value?.some(q => q.name === 'magical')) return; args.totalWoundLoss = args.totalWoundLoss; // Flavour: non-magical AP ignored handled by GM" }] } },

  { range: [25, 28], name: "Alight with Flame",
    description: "Once drawn the weapon bursts into searing flame. If the wielder hits a flammable target, the target suffers one Ablaze Condition.",
    qualities: [],
    effectData: { scriptData: [{ label: "Alight with Flame", trigger: "applyDamage",
      script: "if (args.totalWoundLoss > 0) { args.actor.addCondition('ablaze'); this.script.notification('Target set Ablaze!'); }" }] } },

  { range: [29, 31], name: "Dolorous",
    description: "Death magic permeates the weapon, filling foes with fright. The wielder counts as causing Fear (1).",
    qualities: [],
    effectData: { scriptData: [{ label: "Dolorous — Fear (1)", trigger: "prepareData",
      script: "// Fear (1) — GM should apply Fear psychology to the wielder" }] } },

  { range: [32, 35], name: "Of Leaping Silver Wroth",
    description: "Expert balance and surprising lightness. A melee weapon has the Fast Quality. A ranged weapon grants +10 Initiative in combat.",
    qualities: [{"name":"fast"}],
    effectData: { changes: [{ key: "system.characteristics.i.modifier", mode: 2, value: "10" }] } },

  { range: [36, 39], name: "Carved of Rage",
    description: "Animalistic fury fills the wielder whenever this weapon is drawn. The wielder becomes subject to Frenzy.",
    qualities: [],
    effectData: { scriptData: [{ label: "Carved of Rage — Frenzy", trigger: "prepareData",
      script: "// Wielder is subject to Frenzy when weapon is drawn — GM should apply Frenzy psychology" }] } },

  { range: [40, 43], name: "Envigoured",
    description: "The life-giving wind of Ghyran courses through the weapon. The wielder ignores Fatigue Conditions whilst fighting. The weapon has the Unbreakable Quality.",
    qualities: [{"name":"unbreakable"}],
    effectData: { scriptData: [{ label: "Envigoured — Ignore Fatigue", trigger: "dialog",
      script: "// Wielder ignores Fatigue Conditions while fighting with this weapon" }] } },

  { range: [44, 47], name: "Entwined with Fate",
    description: "Celestial magics imbue the weapon with prognosticative abilities. At the start of each round of combat, the wielder gains one Advantage.",
    qualities: [],
    effectData: { scriptData: [{ label: "Entwined with Fate — +1 Advantage per round", trigger: "startTurn",
      script: "this.actor.system.status.advantage.value += 1; this.script.notification('Gained 1 Advantage from Entwined with Fate');" }] } },

  { range: [48, 51], name: "Of Rigor Wroth",
    description: "Light magic makes a paragon of the wielder. Melee: gains Strike Mighty Blow, Strike to Injure, Strike to Stun. Ranged: gains Fast Shot, Sharpshooter, Sniper.",
    qualities: [],
    effectData: null },

  { range: [52, 54], name: "Of Stalwart Sorcery",
    description: "These weapons strike true as Verena. The weapon has the Precise Quality.",
    qualities: [{"name":"precise"}],
    effectData: null },

  { range: [55, 57], name: "Bewildering",
    description: "Powerful enchantments of bemusement and misdirection. Anyone wounded by the weapon gains the Surprised Condition.",
    qualities: [],
    effectData: { scriptData: [{ label: "Bewildering — Surprised", trigger: "applyDamage",
      script: "if (args.totalWoundLoss > 0) { args.actor.addCondition('surprised'); this.script.notification('Target is Surprised!'); }" }] } },

  { range: [58, 60], name: "Of Bold Brass",
    description: "The weapon's bearer is filled with vim, is immune to Fear, and enjoys +2 SL bonus to resist Terror.",
    qualities: [],
    effectData: { scriptData: [{ label: "Of Bold Brass — Fear Immunity", trigger: "dialog",
      script: "if (args.prefillModifiers?.difficulty?.includes('Terror') || args.prefillModifiers?.difficulty?.includes('Fear')) { args.fields.slBonus += 2; }",
      options: { dialog: { hideScript: "", activateScript: "return true;", submissionScript: "" } } }] } },

  { range: [61, 63], name: "Of the Wolf's Wide Jaws",
    description: "Favoured Ulrican weapons with wolf motifs. The weapon has the Damaging Quality.",
    qualities: [{"name":"damaging"}],
    effectData: null },

  { range: [64, 66], name: "Of Deft and Cunning",
    description: "Myrmidian-crafted weapons of exquisite precision. The wielder benefits from +20 WS or BS, as appropriate.",
    qualities: [],
    effectData: { changes: [{ key: "system.characteristics.ws.modifier", mode: 2, value: "20" }] } },

  { range: [67, 69], name: "Of Salt and Brine",
    description: "Blessed by priests of Manann. The bearer may make a free Action in the first Round of combat. The weapon has the Fast Quality.",
    qualities: [{"name":"fast"}],
    effectData: null },

  { range: [70, 72], name: "Of Grisly Wounds",
    description: "Deathly enchantments ensure wounds are severe. The weapon has the Damaging Quality.",
    qualities: [{"name":"damaging"}],
    effectData: null },

  { range: [73, 75], name: "Of Tooth and Claw",
    description: "Creatures with the Bestial Trait must pass a Difficult (-10) Willpower Test before attacking the wielder.",
    qualities: [],
    effectData: null },

  { range: [76, 78], name: "Of Deepest Banishing",
    description: "Anathema to Daemons and Ethereal Undead. The wielder counts as having three additional Advantage when determining Unstable Trait effects.",
    qualities: [],
    effectData: null },

  { range: [79, 81], name: "Of Undue Substance",
    description: "Strange properties of density and mass. The weapon has the Pummel and Hack Qualities.",
    qualities: [{"name":"pummel"},{"name":"hack"}],
    effectData: null },

  { range: [82, 84], name: "Of Languishing Death",
    description: "Morr calls to those wounded by this weapon. All Wounds the weapon inflicts are Festering Wounds.",
    qualities: [],
    effectData: null },

  { range: [85, 87], name: "Of Keenest Edge",
    description: "Magically keen tip and edges. The weapon has the Hack, Impale, and Penetrating Qualities.",
    qualities: [{"name":"hack"},{"name":"impale"},{"name":"penetrating"}],
    effectData: null },

  { range: [88, 90], name: "Of Bane",
    description: "Enchantments increase deadliness to a given enemy. If it deals damage to a particular creature type, it inflicts twice the number of Wounds. Roll on the Random Creature Table to determine the affected creature.",
    qualities: [],
    effectData: null },

  { range: [91, 92], name: "Of Ceaseless Cleaving",
    description: "Powerful enchantments guide the weapon through flesh and bone. If a hit deals Damage, it inflicts an additional two Wounds.",
    qualities: [],
    effectData: { scriptData: [{ label: "Of Ceaseless Cleaving — +2 Wounds", trigger: "applyDamage",
      script: "args.totalWoundLoss += 2; this.script.notification('Ceaseless Cleaving: +2 Wounds!');" }] } },

  { range: [93, 94], name: "Of Leaping Gold",
    description: "Handles like a feather, lands like a block of lead. The weapon has the Fast, Penetrating, and Precise Qualities.",
    qualities: [{"name":"fast"},{"name":"penetrating"},{"name":"precise"}],
    effectData: null },

  { range: [95, 96], name: "Of Grievous Injury",
    description: "Injuries are cruel and severe. Whenever the wielder rolls on the Critical Injuries Chart they can reverse the numbers and apply whichever is most damaging.",
    qualities: [],
    effectData: null },

  { range: [97, 98], name: "Of Form Mercurial",
    description: "The weapon morphs according to the wielder's movements. Each round the wielder may choose from: Fast, Hack, Impale, Penetrating, and Precise.",
    qualities: [],
    effectData: null },

  { range: [99, 99], name: "Hoarfrost Blade",
    description: "So much as a nick can prove fatal. If a hit deals Damage, it inflicts double the number of Wounds, plus four additional Wounds.",
    qualities: [],
    effectData: { scriptData: [{ label: "Hoarfrost Blade — Double Wounds +4", trigger: "applyDamage",
      script: "args.totalWoundLoss = (args.totalWoundLoss * 2) + 4; this.script.notification('Hoarfrost Blade: Wounds doubled +4!');" }] } },

  { range: [100, 100], name: "Legendary Weapon",
    description: "Roll twice more on this table. Maximum of five abilities; duplicates are not cumulative.",
    qualities: [], effectData: null, reroll: 2 },
];

// ---------------------------------------------------------------------------
// MAGICAL ARMOUR QUALITIES (d100) — Archives of the Empire Vol II, p63
// ---------------------------------------------------------------------------
const MAGICAL_ARMOUR_TABLE = [
  { range: [1, 32], name: "Magical Armour",
    description: "The armour is enchanted, but has no unusual ability beyond protecting against attacks that ignore non-magical armour.",
    qualities: [], effectData: null },

  { range: [33, 38], name: "Gromril Armour",
    description: "The armour is made of Gromril, enjoying all the benefits of that material. It bears Runes identifying the Dwarf Hold to which the suit belongs.",
    qualities: [], effectData: null, material: "gromril" },

  { range: [39, 42], name: "Ithilmar Armour",
    description: "The armour is made of Ithilmar. Eltharin inscription identifies its original owner.",
    qualities: [], effectData: null, material: "ithilmar" },

  { range: [43, 44], name: "Gifted Armour",
    description: "A rare suit of Gromril or Ithilmar made as a gift, sized for a non-Dwarf or non-Elf recipient.",
    qualities: [], effectData: null },

  { range: [45, 56], name: "Warded Armour",
    description: "Protective sigils are etched into the armour. The wearer ignores the first Critical Hit they receive each day.",
    qualities: [],
    effectData: { scriptData: [{ label: "Warded — Ignore First Critical", trigger: "preTakeDamage",
      script: "// GM: The wearer ignores the first Critical Hit each day" }] } },

  { range: [57, 64], name: "Spectral Armour",
    description: "The armour is partially translucent and shimmers. Opponents in melee suffer -10 WS when attacking the wearer.",
    qualities: [],
    effectData: null },

  { range: [65, 76], name: "Dazzling Armour",
    description: "In daylight or near strong light, opponents in melee must pass an Average (+20) Agility Test at the start of each Round or suffer one Blinded Condition. Full suit required.",
    qualities: [],
    effectData: null },

  { range: [77, 88], name: "Trickster's Armour",
    description: "If an attack hits an area protected by this armour, roll 1d10. On a 10, the wearer ignores the hit.",
    qualities: [],
    effectData: { scriptData: [{ label: "Trickster's Armour — 10% Ignore Hit", trigger: "preTakeDamage",
      script: "let roll = Math.floor(Math.random() * 10) + 1; if (roll === 10) { args.totalWoundLoss = 0; this.script.notification(\"Trickster's Armour deflects the blow! (rolled \" + roll + \")\"); } else { this.script.notification(\"Trickster's Armour: rolled \" + roll + \" (need 10)\"); }" }] } },

  { range: [89, 96], name: "Armour of Resilience",
    description: "Powerful Chamon enchantments make the wearer's flesh as strong as steel. +5 Toughness. Full suit required.",
    qualities: [],
    effectData: { changes: [
      { key: "system.characteristics.t.modifier", mode: 2, value: "5" },
      { key: "system.characteristics.t.calculationBonusModifier", mode: 2, value: "-1" }
    ] } },

  { range: [97, 99], name: "Armour of Fortune",
    description: "Misdirects blows. If an attack hits a protected area, roll 1d10. On 9 or 10, the wearer ignores the hit.",
    qualities: [],
    effectData: { scriptData: [{ label: "Armour of Fortune — 20% Ignore Hit", trigger: "preTakeDamage",
      script: "let roll = Math.floor(Math.random() * 10) + 1; if (roll >= 9) { args.totalWoundLoss = 0; this.script.notification('Armour of Fortune deflects the blow! (rolled ' + roll + ')'); } else { this.script.notification('Armour of Fortune: rolled ' + roll + ' (need 9+)'); }" }] } },

  { range: [100, 100], name: "Legendary Armour",
    description: "Roll twice more on this table. Maximum of five abilities; duplicates are not cumulative.",
    qualities: [], effectData: null, reroll: 2 },
];

// ---------------------------------------------------------------------------
// MAGICAL SHIELD QUALITIES (d100) — Archives of the Empire Vol II, p64
// ---------------------------------------------------------------------------
const MAGICAL_SHIELD_TABLE = [
  { range: [1, 45], name: "Magical Shield",
    description: "The shield is magical, but has no further ability.",
    qualities: [], effectData: null },

  { range: [46, 56], name: "Ithilmar Shield",
    description: "Very light. Reduce Encumbrance by 1 to a minimum of 0.",
    qualities: [], effectData: null },

  { range: [57, 68], name: "Gromril Shield",
    description: "Provides +1 to the Shield Quality. A large Gromril shield has Shield 4.",
    qualities: [], effectData: null },

  { range: [69, 75], name: "Shield of Ptolos",
    description: "Enchantments misdirect projectiles. +2 to the Shield Quality when defending against missile weapons.",
    qualities: [], effectData: null },

  { range: [76, 88], name: "Spell Shield",
    description: "Enchanted to deflect magic missiles. The bearer may attempt to dispel any magic missile spell targeting them (Language (Magick) 30).",
    qualities: [], effectData: null },

  { range: [89, 100], name: "Charmed Shield",
    description: "Bearer benefits from +3 SL to Melee Tests when opposing incoming attacks.",
    qualities: [],
    effectData: { scriptData: [{ label: "Charmed Shield — +3 SL Defensive", trigger: "dialog",
      script: "args.fields.slBonus += 3;",
      options: { dialog: { hideScript: "", activateScript: "return args.defending;", submissionScript: "" } } }] } },
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

function _lookup(table, roll) {
  return table.find((entry) => roll >= entry.range[0] && roll <= entry.range[1]);
}

/**
 * Roll on the Magical Weapon Qualities table.
 * Handles "Legendary Weapon" rerolls.
 * Returns array of results, each with roll, name, description, qualities, effectData.
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
        effectData: entry.effectData ?? null,
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
        effectData: entry.effectData ?? null,
        material: entry.material ?? null,
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
  if (!entry) return null;
  return {
    roll,
    name: entry.name,
    description: entry.description,
    qualities: entry.qualities ?? [],
    effectData: entry.effectData ?? null,
  };
}

/**
 * Roll random armour piece and size.
 */
export function rollRandomArmour() {
  const pieceRoll = d100();
  const piece = _lookup(ARMOUR_PIECE_TABLE, pieceRoll);
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
