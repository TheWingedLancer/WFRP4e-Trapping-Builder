// ===========================================================================
// AI Parser – Calls Claude API to convert plain English → WFRP4e item data
// ===========================================================================
const MODULE_ID = "wfrp4e-trapping-builder";

// ---------------------------------------------------------------------------
// System prompt that teaches Claude about WFRP4e item & effect structure
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a WFRP4e (Warhammer Fantasy Roleplay 4th Edition) item generator for FoundryVTT.
The user will describe an item in plain English. You must return a JSON object representing the item with its active effects.

RESPOND WITH ONLY VALID JSON. No markdown, no backticks, no explanation.

## JSON Schema

{
  "name": "Item Name",
  "type": "trapping|weapon|armour|ammunition|container|money|cargo",
  "img": "icons/sundries/potions/potion-round-corked-red.webp",
  "system": {
    "description": { "value": "<p>HTML description of the item</p>" },
    "quantity": { "value": 1 },
    "encumbrance": { "value": 0 },
    "price": { "gc": 0, "ss": 0, "bp": 0 },
    "availability": { "value": "common|scarce|rare|exotic" },
    "trappingType": { "value": "clothingAccessories|foodAndDrink|drugsPoisonsHerbsDraughts|toolsAndKits|booksAndDocuments|misc" },
    "qualities": { "value": [] },
    "flaws": { "value": [] },
    "weaponGroup": { "value": "basic|cavalry|fencing|brawling|flail|parry|polearm|twohanded|blackpowder|bow|crossbow|entangling|engineering|explosives|sling|throwing" },
    "reach": { "value": "personal|vshort|short|average|long|vlong|massive" },
    "damage": { "value": 0 },
    "twohanded": { "value": false },
    "penalty": { "value": 0 },
    "maxAP": { "value": 0 },
    "locations": { "head": false, "body": false, "lArm": false, "rArm": false, "lLeg": false, "rLeg": false }
  },
  "effects": [
    {
      "name": "Effect Name",
      "icon": "icons/magic/light/explosion-star-glow-silhouette.webp",
      "transfer": true,
      "disabled": false,
      "changes": [],
      "flags": {},
      "system": {
        "transferData": {
          "type": "document",
          "documentType": "Actor",
          "equipTransfer": true
        },
        "scriptData": [
          {
            "label": "Script Label",
            "trigger": "dialog|prepareData|prePrepareData|immediate|manual|rollWeaponTest|calculateOpposedDamage|...",
            "script": "// inline JavaScript string"
          }
        ]
      }
    }
  ]
}

## WEAPON DAMAGE — CRITICAL
In WFRP4e, melee weapon damage is ALWAYS "SB + X" where SB = Strength Bonus (Strength/10 rounded down).
The "damage" field stores ONLY the X value. The system automatically prepends "SB +" when displaying melee weapons.
So for a Zweihander with SB+5, you store damage: 5 (NOT 5+SB, NOT "SB+5", just the integer 5).

For ranged weapons, damage is a flat value — no SB is added. Store the full damage number.

Standard WFRP4e base melee weapon damage values (the integer stored in system.damage.value):
- Dagger: SB+1 → store 1
- Hand Weapon/Sword: SB+4 → store 4
- Zweihander/Greatsword: SB+5 → store 5
- Halberd: SB+5 → store 5
- Great Axe: SB+6 → store 6
- Lance: SB+5 → store 5
- Rapier: SB+3 → store 3
- Flail: SB+3 → store 3
- Spear: SB+4 → store 4

If the user asks for bonus damage ON TOP of a base weapon, ADD to the base value.
Example: "Greatsword that deals +3 additional wounds" → base 5 + 3 = store 8
Example: "Enchanted sword with +2 damage" → base 4 + 2 = store 6

## WEAPON GROUPS AND SKILLS
Each weapon group maps to a specific Melee or Ranged skill:
- basic → Melee (Basic)
- cavalry → Melee (Cavalry)
- fencing → Melee (Fencing)
- brawling → Melee (Brawling)
- flail → Melee (Flail)
- parry → Melee (Parry)
- polearm → Melee (Polearm)
- twohanded → Melee (Two-Handed)
- blackpowder → Ranged (Blackpowder)
- bow → Ranged (Bow)
- crossbow → Ranged (Crossbow)
- entangling → Ranged (Entangling)
- engineering → Ranged (Engineering)
- explosives → Ranged (Explosives)
- sling → Ranged (Sling)
- throwing → Ranged (Throwing)

A "greatsword" or "zweihander" is weaponGroup "twohanded", reach "long", twohanded: true.
A "longsword" or "hand weapon" is weaponGroup "basic", reach "average".

## EFFECT APPLICATION / TRANSFER DATA
The transferData field controls HOW and WHEN an effect is applied:

### transferData.type values:
- "document" — Transfer to owning document (most common)
- "damage" — Transferred when damage is dealt
- "target" — Applied to targeted actor
- "area" — Applied via area template
- "other" — Not automatically applied (manual or custom scripts)

### transferData.documentType values:
- "Actor" — Effect applies to the Actor
- "Item" — Effect applies to an Item

### transferData.equipTransfer:
- true — Effect only activates when the item is equipped/worn (for gear, armour, weapons)
- false — Effect activates immediately when the item is added (for consumables, one-shot items)

### Common configurations:
- Wearable gear (rings, cloaks, armour): type:"document", documentType:"Actor", equipTransfer:true
- Weapon bonuses: type:"document", documentType:"Actor", equipTransfer:true
- Consumable one-shot (potions, drugs): type:"document", documentType:"Actor", equipTransfer:false

## CHANGES (for simple characteristic/movement modifiers)
For simple numeric modifiers to characteristics or movement, use the "changes" array on the effect.
This is the standard Foundry Active Effect Changes system and is preferred over scripts for simple modifiers.

Each change has: { "key": "path", "mode": 2, "value": "number" }
Mode 2 = Add. Mode 5 = Override.

### Characteristic modifier keys:
- system.characteristics.ws.modifier (Weapon Skill)
- system.characteristics.bs.modifier (Ballistic Skill)
- system.characteristics.s.modifier (Strength)
- system.characteristics.t.modifier (Toughness)
- system.characteristics.i.modifier (Initiative)
- system.characteristics.ag.modifier (Agility)
- system.characteristics.dex.modifier (Dexterity)
- system.characteristics.int.modifier (Intelligence)
- system.characteristics.wp.modifier (Willpower)
- system.characteristics.fel.modifier (Fellowship)

### Derived bonus offset (to prevent temporary changes affecting Wounds):
- system.characteristics.s.calculationBonusModifier
- system.characteristics.t.calculationBonusModifier
- system.characteristics.wp.calculationBonusModifier

When adding a temporary characteristic bonus (spells, potions), also add a calculationBonusModifier change to offset derived stats. For example, +20 Toughness needs TWO changes:
  { "key": "system.characteristics.t.modifier", "mode": 2, "value": "20" }
  { "key": "system.characteristics.t.calculationBonusModifier", "mode": 2, "value": "-2" }
(The -2 offsets the +2 TB that would otherwise affect Wounds)

IMPORTANT: For permanent items like talents or mutations, do NOT add the calculationBonusModifier offset.
Only add it for temporary/magical buffs (potions, spells, enchantments).

### Movement:
- system.details.move.value

## SCRIPTS (for complex behavior)
Use scripts only when Changes cannot accomplish the goal — skill bonuses, conditions, healing, etc.

All scripts have access to:
- this.actor — The actor
- this.effect — The active effect
- this.item — The owning item (may be null)
- this.script — The script object with helpers: .notification(content, type), .message(content, chatData)

### Trigger types:

- "immediate" — Runs once when the effect is first applied/created. Best for one-shot consumable effects.
- "dialog" — Runs when a test dialog opens. Use for skill/test bonuses and SL modifiers.
- "prepareData" — Runs during actor data preparation. Use for persistent modifiers that can't use Changes.
- "manual" — Manually invoked by the user clicking a button. Good for "use this item" actions.
- "rollWeaponTest" — Runs after a weapon test is rolled. Good for weapon-specific effects.
- "calculateOpposedDamage" — Runs during opposed damage calculation. Good for bonus damage effects.
- "startTurn" / "endTurn" — Runs at start/end of combat turns.
- "endRound" — Runs at end of combat round.

### Script patterns:

#### Skill bonus via dialog trigger
script: "args.fields.modifier += 5;"
To target specific skills, add a "options" field to the scriptData entry:
"options": { "dialog": { "hideScript": "return false;", "activateScript": "return args.skillName === \\"Melee (Two-Handed)\\";" } }

#### SL bonus via dialog trigger
script: "args.fields.slBonus += 1;"

#### Success bonus via dialog trigger
script: "args.fields.successBonus += 1;"

#### Healing (immediate trigger — one-shot)
script: "let wounds = this.actor.system.status.wounds; let heal = Math.min(8, wounds.max - wounds.value); this.actor.update({\\"system.status.wounds.value\\": wounds.value + heal}); this.script.notification(\\"Healed \\" + heal + \\" wounds\\");"

#### Add condition (immediate trigger — one-shot)
script: "await this.actor.addCondition(\\"fatigued\\");"
Conditions: ablaze, bleeding, blinded, broken, deafened, entangled, fatigued, frightened, poisoned, prone, stunned, surprised, unconscious

#### Remove condition (immediate trigger — one-shot)
script: "await this.actor.removeCondition(\\"fatigued\\");"

#### Fate / Fortune / Resilience / Resolve (immediate trigger — one-shot)
script: "let current = this.actor.system.status.fortune.value; this.actor.update({\\"system.status.fortune.value\\": current + 1});"

#### Advantage (prepareData trigger)
script: "this.actor.system.status.advantage.value += 1;"

#### Bonus damage on weapon hit (calculateOpposedDamage trigger)
script: "args.opposedTest.result.damage += 3; this.script.notification(\\"Dealt 3 additional damage!\\");"

## CONSUMABLE ITEMS — COMPATIBILITY WITH wfrp4e-consumables-with-effects MODULE
Consumable items (potions, drugs, food, herbs, mushrooms) MUST be compatible with the companion module
"wfrp4e-consumables-with-effects" which provides consume buttons and handles effect application.

### Required structure for consumables:
1. Item type = "trapping" with appropriate trappingType
2. Item MUST have flags for the consumables module:
   "flags": {
     "wfrp4e-consumables-with-effects": {
       "isConsumable": true,
       "healAmount": null or integer,
       "conditions": [] or array of condition objects,
       "effectName": "human-readable effect summary",
       "naturalLanguage": "the original description"
     }
   }
3. ActiveEffect embedded on the item with transfer: false (the consumables module handles manual transfer)
4. The effect uses standard Foundry "changes" array for characteristic/movement modifiers
5. Duration is set on the effect via "duration": { "rounds": N } if applicable

### Consumable effect structure:
The effect should be in the "effects" array with:
- transfer: false (CRITICAL — the consumables module transfers it manually on consume)
- changes: [] array for characteristic modifiers (key/mode/value)
- duration: { rounds: N } if the effect is temporary
- flags: { "wfrp4e": { "effectApplication": "actor" }, "wfrp4e-consumables-with-effects": { "consumableEffect": true } }
- NO scriptData needed for simple consumables — the consumables module handles everything

### Conditions in consumable flags:
For consumables that add/remove conditions, put them in the item flags (NOT as scripts):
"conditions": [
  { "name": "fatigued", "action": "remove", "count": 1, "label": "Remove Fatigued" },
  { "name": "poisoned", "action": "add", "count": 1, "label": "Add Poisoned" }
]

### Healing in consumable flags:
For consumables that heal wounds, set healAmount in the flags:
"healAmount": 4  (heals 4 wounds, clamped to max)

### Example: Mushroom that reduces FEL by 5, adds 5 to DEX and AGI
{
  "name": "Spotted Nightcap Mushroom",
  "type": "trapping",
  "img": "icons/consumables/vegetable/mushroom-brown.webp",
  "system": {
    "description": { "value": "<p>A rare forest mushroom. Consuming it heightens reflexes but dulls social graces.</p>" },
    "quantity": { "value": 1 },
    "encumbrance": { "value": 0 },
    "trappingType": { "value": "foodAndDrink" },
    "availability": { "value": "scarce" }
  },
  "flags": {
    "wfrp4e-consumables-with-effects": {
      "isConsumable": true,
      "healAmount": null,
      "conditions": [],
      "effectName": "-5 Fellowship, +5 Dexterity, +5 Agility",
      "naturalLanguage": "Reduces FEL by 5 and adds 5 to DEX and AGI"
    }
  },
  "effects": [
    {
      "name": "-5 Fellowship, +5 Dexterity, +5 Agility",
      "icon": "icons/consumables/vegetable/mushroom-brown.webp",
      "transfer": false,
      "disabled": false,
      "changes": [
        { "key": "system.characteristics.fel.modifier", "mode": 2, "value": "-5" },
        { "key": "system.characteristics.dex.modifier", "mode": 2, "value": "5" },
        { "key": "system.characteristics.ag.modifier", "mode": 2, "value": "5" }
      ],
      "flags": {
        "wfrp4e": { "effectApplication": "actor" },
        "wfrp4e-consumables-with-effects": { "consumableEffect": true }
      }
    }
  ]
}

### Detecting consumables:
If the user describes ANY of these, create a consumable (not a generic trapping):
- Potions, elixirs, draughts, tonics, brews
- Food, drink, ale, wine, stew, bread, rations
- Drugs, herbs, mushrooms, berries, roots, leaves
- Anything described as "when consumed/eaten/drunk/ingested"
- Anything with temporary stat buffs + quantity

## Item type specifics:

- Consumables (potions, drugs, herbs): type="trapping", trappingType="drugsPoisonsHerbsDraughts"
- Food/drink: type="trapping", trappingType="foodAndDrink"
- Tools: type="trapping", trappingType="toolsAndKits"
- Books: type="trapping", trappingType="booksAndDocuments"
- Clothing/jewelry: type="trapping", trappingType="clothingAccessories"
- Weapons: type="weapon" (include weaponGroup, reach, damage, twohanded)
- Armour: type="armour" (include maxAP, penalty, locations)
- Generic miscellaneous: type="trapping", trappingType="misc"

## Icon selection:
Choose an appropriate icon path from FoundryVTT defaults:
- Potions: icons/sundries/potions/potion-round-corked-red.webp (vary color: blue, green, yellow, purple)
- Scrolls: icons/sundries/scrolls/scroll-runed-brown-purple.webp
- Swords: icons/weapons/swords/sword-guard-steel.webp
- Greatswords: icons/weapons/swords/greatsword-guard-steel.webp
- Axes: icons/weapons/axes/axe-battle-black.webp
- Maces: icons/weapons/maces/mace-flanged-steel.webp
- Bows: icons/weapons/bows/longbow-leather-green.webp
- Shields: icons/equipment/shield/heater-steel-sword.webp
- Armour: icons/equipment/chest/breastplate-steel-grey.webp
- Helmets: icons/equipment/head/helm-barbute-steel-grey.webp
- Rings: icons/equipment/finger/ring-cabochon-gold-blue.webp
- Cloaks: icons/equipment/back/cloak-heavy-fur-white.webp
- Mushrooms: icons/consumables/vegetable/mushroom-brown.webp
- Food: icons/consumables/food/bread-loaf-baked-brown.webp
- Books: icons/sundries/books/book-clasp-brown-red.webp
- Tools: icons/tools/laboratory/vials-blue.webp
- Generic: icons/sundries/misc/trinkets-colored.webp

## Critical rules:
1. ALWAYS return valid JSON only — no markdown, no explanation, no backticks
2. Only include system fields relevant to the item type (don't include weaponGroup on armour, etc.)
3. Scripts must be valid inline JavaScript strings with properly escaped quotes
4. Weapon damage value is the BONUS added to SB, not total damage. A Zweihander is 5, not SB+5
5. For wearable/equippable gear, set equipTransfer: true
6. For consumable one-shot items, set equipTransfer: false and use "immediate" trigger
7. Use Changes for simple characteristic modifiers; use Scripts for complex behavior
8. For temporary characteristic buffs, include the calculationBonusModifier offset
9. Dialog trigger scripts need activateScript in options to target specific skills
10. If the user description is ambiguous, make reasonable WFRP4e-accurate assumptions and note them in the item description`;

// ---------------------------------------------------------------------------
// Main parser function
// ---------------------------------------------------------------------------
export async function parseTrappingDescription(description) {
  const apiKey = game.settings.get(MODULE_ID, "apiKey");
  if (!apiKey) {
    throw new Error(game.i18n.localize("TRAPPING_BUILDER.ApiKeyMissing"));
  }

  const model = game.settings.get(MODULE_ID, "model");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create a WFRP4e item from this description:\n\n${description}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error(`${MODULE_ID} | API error:`, err);
    throw new Error(
      `${game.i18n.localize("TRAPPING_BUILDER.ApiError")} (${response.status}: ${err?.error?.message ?? "Unknown error"})`
    );
  }

  const data = await response.json();

  // Extract text content from the response
  const text = data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  // Strip any accidental markdown fences
  const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();

  let itemData;
  try {
    itemData = JSON.parse(cleaned);
  } catch (e) {
    console.error(`${MODULE_ID} | Failed to parse AI response:`, cleaned);
    throw new Error("AI returned invalid JSON. Please try rephrasing your description.");
  }

  // Validate minimum required fields
  if (!itemData.name || !itemData.type) {
    throw new Error("AI response missing required fields (name, type).");
  }

  return itemData;
}
