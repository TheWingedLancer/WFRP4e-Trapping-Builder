// ===========================================================================
// Dwarven Runes — Dwarf Player's Guide (p123-130)
//
// Each rune entry includes:
//   - name: rune name
//   - category: weapon | armour | talisman
//   - isMaster: true if it's a master rune
//   - slsRequired: SLs needed on the Extended Runesmithing Test
//   - maxCount: how many of this rune can be stacked (usually 3, master = 1)
//   - description: rules text
//   - effectData: WFRP4e Active Effect data (changes / scriptData)
//     Per-rune-count effects use {perRune: true} to scale with count
// ===========================================================================

// ---------------------------------------------------------------------------
// WEAPON RUNES (p125)
// Can only be forged upon a melee weapon — axe, hammer, or occasionally sword.
// ---------------------------------------------------------------------------
export const WEAPON_RUNES = [
  {
    name: "Rune of Cleaving",
    category: "weapon", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "The weapon inflicts +1 Damage for each Rune of Cleaving.",
    effectData: { perRune: true, scriptData: [{ label: "Rune of Cleaving", trigger: "applyDamage",
      script: "// +1 Damage per Rune of Cleaving — applied as weapon damage bonus by GM" }] },
  },
  {
    name: "Rune of Retribution",
    category: "weapon", isMaster: false, slsRequired: 12, maxCount: 3,
    description: "Any Critical Wounds inflicted by this weapon may add +20 to rolls on a Critical Wound table for each Rune of Retribution.",
    effectData: null,
  },
  {
    name: "Rune of Cutting",
    category: "weapon", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "When attacking with this weapon, you may ignore 2 APs of armour per Rune of Cutting on successful hits.",
    effectData: null,
  },
  {
    name: "Rune of Daunting",
    category: "weapon", isMaster: false, slsRequired: 14, maxCount: 3,
    description: "Whilst this weapon is drawn, you gain the Fear Creature Trait. Your Fear Rating equals the number of Runes of Daunting. If you already have a Fear Rating, increase by +1 per rune.",
    effectData: null,
  },
  {
    name: "Rune of Fire",
    category: "weapon", isMaster: false, slsRequired: 16, maxCount: 3,
    description: "Once drawn, the weapon's blade bursts into flames (20 yards illumination), inflicting 1 Ablaze Condition on enemies it damages. With 2-3 runes, it can make ranged attacks (Blast 4, Range = WP Bonus, 1 Ablaze per rune).",
    effectData: { scriptData: [{ label: "Rune of Fire — Ablaze", trigger: "applyDamage",
      script: "if (args.totalWoundLoss > 0) { args.actor.addCondition('ablaze'); this.script.notification('Rune of Fire: Target set Ablaze!'); }" }] },
  },
  {
    name: "Rune of Fury",
    category: "weapon", isMaster: false, slsRequired: 15, maxCount: 3,
    description: "Whilst wielding this weapon, you gain 1 level of Dual Wielder for each Rune of Fury, which may exceed the Talent's usual maximum.",
    effectData: null,
  },
  {
    name: "Grudge Rune",
    category: "weapon", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "Nominate a Blood Grudge enemy. For each Grudge Rune, the weapon gains +10 to hit and +1 Damage against the target. May nominate a new target when the enemy is slain.",
    effectData: null,
  },
  {
    name: "Rune of Might",
    category: "weapon", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "When attacking a target of a larger Size than yourself, the weapon inflicts +3 Damage for each Rune of Might.",
    effectData: null,
  },
  {
    name: "Rune of Speed",
    category: "weapon", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "Whilst carrying this weapon in combat, you gain +10 Initiative for each Rune of Speed.",
    effectData: { perRune: true, changes: [{ key: "system.characteristics.i.modifier", mode: 2, value: "10" }] },
  },
  {
    name: "Rune of Striking",
    category: "weapon", isMaster: false, slsRequired: 14, maxCount: 3,
    description: "When attacking with this weapon, you gain +10 to your Melee Skill for each Rune of Striking (matching the weapon's Melee specialisation).",
    effectData: { perRune: true, changes: [{ key: "system.characteristics.ws.modifier", mode: 2, value: "10" }] },
  },

  // Master Weapon Runes
  {
    name: "Master Rune of Alaric the Mad",
    category: "weapon", isMaster: true, slsRequired: 30, maxCount: 1,
    description: "Any attacks made by this weapon ignore the target's AP, armour Qualities, and any other benefits provided by the target's armour.",
    effectData: null,
  },
  {
    name: "Master Rune of Breaking",
    category: "weapon", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "When this weapon successfully attacks an enemy who Opposed with Melee, or successfully Opposes an incoming attack, any magic weapon used by your opponent is destroyed.",
    effectData: null,
  },
  {
    name: "Master Rune of Flight",
    category: "weapon", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "The weapon can be used as a Thrown ranged weapon (Range SB×3). When used on a ranged attack it gains the Accurate Quality, and returns to your hand after inflicting Damage.",
    effectData: null,
  },
  {
    name: "Master Rune of Skalf Blackhammer",
    category: "weapon", isMaster: true, slsRequired: 28, maxCount: 1,
    description: "Any successful attack with this weapon counts as scoring a Critical.",
    effectData: null,
  },
  {
    name: "Master Rune of the Slayer",
    category: "weapon", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "Choose a specific enemy type (Daemons, Undead, Dragons, Goblins, Elves, etc.). When attacking that target, you may Reverse any attack Tests and Reverse any rolls they make on a Critical Wound table.",
    effectData: null,
  },
  {
    name: "Master Rune of Snorri Spangelhelm",
    category: "weapon", isMaster: true, slsRequired: 22, maxCount: 1,
    description: "Any failed Melee Tests made with this weapon always count as achieving a success with 0 SL. An attack can still fail if the target scores more SLs on their Opposed Test.",
    effectData: null,
  },
  {
    name: "Master Rune of Haste",
    category: "weapon", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "The weapon gains the Fast Quality, except all Tests to defend against it with Melee suffer a -30 penalty (instead of -10).",
    qualities: [{"name":"fast"}],
    effectData: null,
  },
];

// ---------------------------------------------------------------------------
// ARMOUR RUNES (p126)
// Can only be forged upon good quality metal armour. Benefits extend to helm.
// ---------------------------------------------------------------------------
export const ARMOUR_RUNES = [
  {
    name: "Rune of Force",
    category: "armour", isMaster: false, slsRequired: 14, maxCount: 3,
    description: "Whilst wearing this armour, if you make a successful Melee attack as part of a Charge, you inflict bonus Damage for each Rune of Force equal to the APs of your most armoured location.",
    effectData: null,
  },
  {
    name: "Rune of Fortitude",
    category: "armour", isMaster: false, slsRequired: 14, maxCount: 3,
    description: "Whilst wearing this armour, you increase your Toughness by +10 for each Rune of Fortitude.",
    effectData: { perRune: true, changes: [{ key: "system.characteristics.t.modifier", mode: 2, value: "10" }] },
  },
  {
    name: "Rune of Iron",
    category: "armour", isMaster: false, slsRequired: 12, maxCount: 3,
    description: "Whilst wearing this armour, you gain +2 Wounds for each Rune of Iron. These Wounds are lost when the armour is removed.",
    effectData: { perRune: true, changes: [{ key: "system.status.wounds.modifier", mode: 2, value: "2" }] },
  },
  {
    name: "Rune of Resistance",
    category: "armour", isMaster: false, slsRequired: 12, maxCount: 3,
    description: "Whilst wearing this armour, you gain +10 for each Rune of Resistance on Tests to Oppose an incoming Melee attack.",
    effectData: null,
  },
  {
    name: "Rune of Shielding",
    category: "armour", isMaster: false, slsRequired: 12, maxCount: 3,
    description: "Whilst wearing this armour, any incoming ranged attacks or spells reduce the Damage they inflict by 2 for each Rune of Shielding. If reduced to 0 or less, you lose no Wounds.",
    effectData: { perRune: true, scriptData: [{ label: "Rune of Shielding — Reduce Ranged/Spell Damage", trigger: "preTakeDamage",
      script: "// Reduce incoming ranged/spell damage by 2 per rune — GM adjudicated" }] },
  },
  {
    name: "Rune of Stone",
    category: "armour", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "The armour gains +1 AP for each Rune of Stone. Suits with only Runes of Stone (no other runes) are exempt from the Rule of Pride.",
    effectData: null, // AP modification requires direct AP editing, not an effect
  },

  // Master Armour Runes
  {
    name: "Master Rune of Adamant",
    category: "armour", isMaster: true, slsRequired: 22, maxCount: 1,
    description: "When you suffer a Critical Wound whilst wearing this armour, you may Reverse the roll on the Critical Wound table.",
    effectData: null,
  },
  {
    name: "Master Rune of Gromril",
    category: "armour", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "The armour loses the Weakpoints Flaw, can never be Damaged except by a Runic Flaw, and never reduces its AP due to Talents or effects such as the Penetrating Quality.",
    effectData: null,
  },
  {
    name: "Master Rune of Steel",
    category: "armour", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "Whilst wearing this armour, you can only suffer a maximum of 10 Wounds from any single instance of Damage.",
    effectData: { scriptData: [{ label: "Master Rune of Steel — Max 10 Wounds", trigger: "preTakeDamage",
      script: "if (args.totalWoundLoss > 10) { args.totalWoundLoss = 10; this.script.notification('Master Rune of Steel caps damage at 10 Wounds'); }" }] },
  },
];

// ---------------------------------------------------------------------------
// RUNIC TALISMANS (p127)
// Forged upon jewellery or personal effects — rings, amulets, crowns, etc.
// ---------------------------------------------------------------------------
export const TALISMAN_RUNES = [
  {
    name: "Rune of Clear Sight",
    category: "talisman", isMaster: false, slsRequired: 8, maxCount: 3,
    description: "Negate penalties from fog, mist, smoke, or non-magical vapours. 2 runes: also penetrate magical vapours. 3 runes: see clearly even in total darkness.",
    effectData: null,
  },
  {
    name: "Rune of Truth",
    category: "talisman", isMaster: false, slsRequired: 8, maxCount: 3,
    description: "The talisman glows if pressed into contact with a faked, forged, or counterfeited item. 2 runes: also identify magical illusions. 3 runes: reveal the precise method of deception.",
    effectData: null,
  },
  {
    name: "Rune of Far Sight",
    category: "talisman", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "When pressed to the eye, vision is magnified up to a mile. 2 runes: 2 miles. 3 runes: 4 miles.",
    effectData: null,
  },
  {
    name: "Rune of the Furnace",
    category: "talisman", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "You can never acquire the Ablaze Condition, are immune to heat exposure, and reduce all incoming fire/flaming Damage by 4 per rune.",
    effectData: null,
  },
  {
    name: "Rune of Luck",
    category: "talisman", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "You gain 1 Fortune point per Rune of Luck (can exceed usual maximum). Lost when talisman is removed; cannot be regained until next session.",
    effectData: null,
  },
  {
    name: "Rune of Restoration",
    category: "talisman", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "After a good night's sleep whilst wearing this talisman, regain Toughness Bonus in Wounds per Rune of Restoration.",
    effectData: null,
  },
  {
    name: "Rune of Spellbreaking",
    category: "talisman", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "You may attempt to dispel any spell targeting you or a visible point within Willpower yards. Oppose with Runesmithing. Activatable once per combat per rune.",
    effectData: null,
  },
  {
    name: "Rune of Spelleating",
    category: "talisman", isMaster: false, slsRequired: 10, maxCount: 3,
    description: "If you dispel a spell via Rune of Spellbreaking, the caster cannot re-attempt it for WP Bonus Rounds (1 rune), Hours (2 runes), or Weeks (3 runes).",
    effectData: null,
  },
  {
    name: "Rune of Warding",
    category: "talisman", isMaster: false, slsRequired: 15, maxCount: 3,
    description: "Impose a -10 penalty per Rune of Warding on attack Tests or spellcasting Tests targeting you.",
    effectData: null,
  },

  // Master Talisman Runes
  {
    name: "Master Rune of Balance",
    category: "talisman", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "If an enemy within line of sight casts a spell, you may Reverse their Spellcasting Test, or Reverse your Opposed Runesmithing Test.",
    effectData: null,
  },
  {
    name: "Master Rune of Industry",
    category: "talisman", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "Whilst wearing this talisman, you may take an extra Endeavour between adventures.",
    effectData: null,
  },
  {
    name: "Master Rune of Kingship",
    category: "talisman", isMaster: true, slsRequired: 24, maxCount: 1,
    description: "You may Reverse any Charm, Intimidate, and Leadership Tests you make that target a Dwarf or group mostly consisting of Dwarfs.",
    effectData: null,
  },
  {
    name: "Master Rune of Passage",
    category: "talisman", isMaster: true, slsRequired: 20, maxCount: 1,
    description: "At walking pace, you can Move through solid, immobile objects like trees, rock, and metal cages. Cannot move through animals or Undead. Cannot end Move inside a solid object.",
    effectData: null,
  },
  {
    name: "Master Rune of Spite",
    category: "talisman", isMaster: true, slsRequired: 24, maxCount: 1,
    description: "Whenever you take Damage from a Melee attack, the attacker immediately suffers 2d10 Damage to a random location, reduced by TB and AP.",
    effectData: null,
  },
];

// ---------------------------------------------------------------------------
// ALL RUNES — combined for lookups
// ---------------------------------------------------------------------------
export const ALL_RUNES = [...WEAPON_RUNES, ...ARMOUR_RUNES, ...TALISMAN_RUNES];

/**
 * Get runes applicable to a given item type.
 * @param {"weapon"|"armour"|"trapping"} itemType
 * @returns {Array} applicable rune list
 */
export function getRunesForItemType(itemType) {
  switch (itemType) {
    case "weapon": return WEAPON_RUNES;
    case "armour": return ARMOUR_RUNES;
    case "trapping": return TALISMAN_RUNES;
    default: return [];
  }
}

/**
 * Validate whether a rune can be added to an item, enforcing the
 * Rules of the Runes from the Dwarf Player's Guide (p123-124):
 *
 * - RULE OF THREE (p123): No runic item can bear more than 3 runes total.
 *   Multiple instances of the same rune each count separately toward this limit.
 *
 * - RULE OF JEALOUSY (p124): A runic item may not bear more than one master rune.
 *   If more than one version of the same master rune appears within 100 yards,
 *   only the oldest functions (but that's a runtime check, not enforced here).
 *
 * - MAX COUNT PER RUNE: Each rune type has a maximum number of times it can
 *   appear on a single item (usually 3, master runes = 1).
 *
 * NOTE: The Rule of Pride (p124) — identical runic items within 100 yards
 * deactivate — is a runtime/world rule that can't be enforced at creation time.
 *
 * @param {Array<{name: string, count: number}>} selectedRunes - runes already on the item
 * @param {object} newRune - rune definition to validate adding
 * @returns {{valid: boolean, reason?: string}} validation result
 */
export function validateRuneAddition(selectedRunes, newRune) {
  // Rule of Three: max 3 runes total per item
  const totalRunes = selectedRunes.reduce((sum, r) => sum + r.count, 0);
  if (totalRunes >= 3) {
    return { valid: false, reason: "Rule of Three: No runic item can bear more than three runes." };
  }

  // Rule of Jealousy: max 1 master rune per item
  if (newRune.isMaster) {
    const hasMaster = selectedRunes.some((r) => {
      const runeData = ALL_RUNES.find((rd) => rd.name === r.name);
      return runeData?.isMaster;
    });
    if (hasMaster) {
      return { valid: false, reason: "Rule of Jealousy: A runic item may not bear more than one master rune." };
    }
  }

  // Check max count for this specific rune
  const existing = selectedRunes.find((r) => r.name === newRune.name);
  const currentCount = existing?.count ?? 0;
  if (currentCount >= newRune.maxCount) {
    return { valid: false, reason: `This rune can only be inscribed ${newRune.maxCount} time(s) on a single item.` };
  }

  return { valid: true };
}
