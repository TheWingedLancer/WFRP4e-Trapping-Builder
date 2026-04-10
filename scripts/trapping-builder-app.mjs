// ===========================================================================
// TrappingBuilderApp – ApplicationV2 + HandlebarsApplicationMixin (V13)
// ===========================================================================
import { parseTrappingDescription } from "./ai-parser.mjs";
import {
  createWorldItem,
  createActorItem,
  buildPreviewSummary,
} from "./item-factory.mjs";
import {
  rollMagicalWeaponQuality,
  rollMagicalArmourQuality,
  rollMagicalShieldQuality,
  rollRandomArmour,
} from "./random-tables.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class TrappingBuilderApp extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  // -----------------------------------------------------------------------
  // Static configuration
  // -----------------------------------------------------------------------
  static DEFAULT_OPTIONS = {
    id: "trapping-builder",
    classes: ["sheet", "warhammer", "wfrp4e", "classic-font", "trapping-builder-app"],
    tag: "form",
    window: {
      title: "TRAPPING_BUILDER.Title",
      icon: "fas fa-wand-magic-sparkles",
      resizable: true,
      contentClasses: ["standard-form"],
    },
    position: {
      width: 560,
      height: "auto",
    },
    form: {
      handler: TrappingBuilderApp.#onFormSubmit,
      submitOnChange: false,
      closeOnSubmit: false,
    },
    actions: {
      generate: TrappingBuilderApp.#onGenerate,
      reset: TrappingBuilderApp.#onReset,
      createWorld: TrappingBuilderApp.#onCreateWorld,
      createActor: TrappingBuilderApp.#onCreateActor,
      rollWeaponMagic: TrappingBuilderApp.#onRollWeaponMagic,
      rollArmourMagic: TrappingBuilderApp.#onRollArmourMagic,
      rollArmourSize: TrappingBuilderApp.#onRollArmourSize,
      rollShieldMagic: TrappingBuilderApp.#onRollShieldMagic,
    },
  };

  static PARTS = {
    body: {
      template:
        "modules/wfrp4e-trapping-builder/templates/trapping-builder.hbs",
    },
  };

  // -----------------------------------------------------------------------
  // Instance state
  // -----------------------------------------------------------------------

  /** @type {Actor|null} Optional target actor passed in from the sheet */
  #actor = null;

  /** @type {string} Current user description text */
  #description = "";

  /** @type {object|null} Parsed item data from AI */
  #parsedData = null;

  /** @type {boolean} Whether we're currently generating */
  #generating = false;

  /** @type {string|null} Error message to display */
  #error = null;

  /** @type {Array} Results from random table rolls */
  #rollResults = [];

  constructor(options = {}) {
    super(options);
    this.#actor = options.actor ?? null;
  }

  // -----------------------------------------------------------------------
  // Data preparation for the template
  // -----------------------------------------------------------------------
  async _prepareContext(options) {
    let preview = null;

    if (this.#parsedData) {
      const summary = buildPreviewSummary(this.#parsedData);
      preview = {
        ...this.#parsedData,
        ...summary,
        weaponDetails:
          this.#parsedData.type === "weapon"
            ? {
                group:
                  this.#parsedData.system?.weaponGroup?.value ?? "basic",
                damage: this.#parsedData.system?.damage?.value ?? 0,
                reach: this.#parsedData.system?.reach?.value ?? "average",
              }
            : null,
        armourDetails:
          this.#parsedData.type === "armour"
            ? {
                ap: _formatAP(this.#parsedData.system?.AP),
                penalty: this.#parsedData.system?.penalty?.value ?? "",
                locationList: _formatLocations(
                  this.#parsedData.system?.locations
                ),
              }
            : null,
      };
    }

    // Build list of available actors (characters) for the dropdown
    const actors = game.actors
      ?.filter((a) => a.type === "character" && a.isOwner)
      .map((a) => ({ id: a.id, name: a.name })) ?? [];

    // Determine which random roll buttons to show
    const itemType = this.#parsedData?.type;
    const isWeapon = itemType === "weapon";
    const isArmour = itemType === "armour";
    const isShield = isWeapon && ["parry", "basic"].includes(this.#parsedData?.system?.weaponGroup?.value)
      && this.#parsedData?.system?.qualities?.value?.some(q => q.name === "shield");
    const showRandomButtons = isWeapon || isArmour || isShield;

    return {
      description: this.#description,
      generating: this.#generating,
      error: this.#error,
      preview,
      actors,
      showRandomButtons,
      isWeapon: isWeapon && !isShield,
      isArmour,
      isShield,
      rollResults: this.#rollResults,
    };
  }

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  /** Form submission handler — not used directly, we use action buttons */
  static async #onFormSubmit(event, form, formData) {
    event.preventDefault();
  }

  static async #onGenerate(event, target) {
    // Grab text from the textarea
    const textarea = this.element.querySelector("#tb-description");
    this.#description = textarea?.value?.trim() ?? "";

    if (!this.#description) {
      this.#error = "Please describe the item you want to create.";
      this.render();
      return;
    }

    this.#error = null;
    this.#generating = true;
    this.#parsedData = null;
    this.render();

    try {
      this.#parsedData = await parseTrappingDescription(this.#description);
      this.#error = null;
    } catch (err) {
      console.error("Trapping Builder | Generation failed:", err);
      this.#error = err.message;
    } finally {
      this.#generating = false;
      this.render();
    }
  }

  static #onReset(event, target) {
    this.#description = "";
    this.#parsedData = null;
    this.#error = null;
    this.#generating = false;
    this.#rollResults = [];
    this.render();
  }

  static async #onCreateWorld(event, target) {
    if (!this.#parsedData) return;
    this.#applyNameOverride();

    try {
      const item = await createWorldItem(this.#parsedData);
      ui.notifications.info(
        `${game.i18n.localize("TRAPPING_BUILDER.Success")} Created "${item.name}" in Items directory.`
      );
      // Open the created item's sheet
      item.sheet.render(true);
    } catch (err) {
      console.error("Trapping Builder | Creation failed:", err);
      ui.notifications.error(`Failed to create item: ${err.message}`);
    }
  }

  static async #onCreateActor(event, target) {
    if (!this.#parsedData) return;
    this.#applyNameOverride();

    // Read the selected actor from the dropdown
    const select = this.element.querySelector("#tb-actor-select");
    const actorId = select?.value;
    if (!actorId) {
      ui.notifications.warn("No actor selected.");
      return;
    }

    const actor = game.actors.get(actorId);
    if (!actor) {
      ui.notifications.error("Selected actor not found.");
      return;
    }

    try {
      const item = await createActorItem(actor, this.#parsedData);
      ui.notifications.info(
        `${game.i18n.localize("TRAPPING_BUILDER.Success")} Added "${item.name}" to ${actor.name}.`
      );
    } catch (err) {
      console.error("Trapping Builder | Creation failed:", err);
      ui.notifications.error(`Failed to add item: ${err.message}`);
    }
  }

  // -----------------------------------------------------------------------
  // Random Table Rolls
  // -----------------------------------------------------------------------

  static #onRollWeaponMagic(event, target) {
    if (!this.#parsedData) return;
    const results = rollMagicalWeaponQuality();

    // Add "magical" quality if not already present
    this.#ensureQuality("magical");

    // Add any qualities from the roll results
    for (const result of results) {
      if (result.qualities) {
        for (const q of result.qualities) {
          this.#ensureQuality(q.name, q.value);
        }
      }
    }

    // Append the roll description to the item description
    for (const result of results) {
      this.#appendDescription(`<p><strong>${result.name}:</strong> ${result.description}</p>`);
    }

    this.#rollResults.push(...results);
    this.render();
  }

  static #onRollArmourMagic(event, target) {
    if (!this.#parsedData) return;
    const results = rollMagicalArmourQuality();

    // Add "magical" quality
    this.#ensureQuality("magical");

    for (const result of results) {
      // Handle material-based results (Gromril/Ithilmar upgrade the armour)
      if (result.material === "gromril") {
        this.#ensureQuality("impenetrable");
        this.#ensureQuality("durable", 4);
        this.#ensureQuality("fine", 1);
        // Upgrade AP to 3 for all covered locations
        if (this.#parsedData.system?.AP) {
          for (const [loc, val] of Object.entries(this.#parsedData.system.AP)) {
            if (val > 0) this.#parsedData.system.AP[loc] = 3;
          }
        }
      } else if (result.material === "ithilmar") {
        this.#ensureQuality("impenetrable");
        this.#ensureQuality("durable", 2);
        this.#ensureQuality("fine", 2);
        // Reduce encumbrance by 2 (min 0)
        if (this.#parsedData.system?.encumbrance?.value !== undefined) {
          this.#parsedData.system.encumbrance.value = Math.max(0, this.#parsedData.system.encumbrance.value - 2);
        }
      }

      if (result.qualities) {
        for (const q of result.qualities) {
          this.#ensureQuality(q.name, q.value);
        }
      }

      this.#appendDescription(`<p><strong>${result.name}:</strong> ${result.description}</p>`);
    }

    this.#rollResults.push(...results);
    this.render();
  }

  static #onRollShieldMagic(event, target) {
    if (!this.#parsedData) return;
    const result = rollMagicalShieldQuality();
    if (!result) return;

    this.#ensureQuality("magical");

    if (result.qualities) {
      for (const q of result.qualities) {
        this.#ensureQuality(q.name, q.value);
      }
    }

    this.#appendDescription(`<p><strong>${result.name}:</strong> ${result.description}</p>`);
    this.#rollResults.push(result);
    this.render();
  }

  static #onRollArmourSize(event, target) {
    if (!this.#parsedData) return;
    const result = rollRandomArmour();

    // Material → AP value and base qualities/flaws
    const materialStats = {
      leather:        { ap: 1, qualities: [], flaws: [] },
      boiled_leather: { ap: 2, qualities: [], flaws: [{"name":"weakpoints"}] },
      mail:           { ap: 2, qualities: [{"name":"flexible"}], flaws: [] },
      plate:          { ap: 2, qualities: [{"name":"impenetrable"}], flaws: [{"name":"weakpoints"}] },
    };
    const mat = materialStats[result.material] ?? materialStats.plate;

    // Coverage → which AP locations get filled
    const ap = { head: 0, lArm: 0, rArm: 0, body: 0, lLeg: 0, rLeg: 0 };
    const locations = { head: false, lArm: false, rArm: false, body: false, lLeg: false, rLeg: false };

    const coverageMap = {
      head:            ["head"],
      body:            ["body"],
      "body+arms":     ["body", "lArm", "rArm"],
      arms:            ["lArm", "rArm"],
      legs:            ["lLeg", "rLeg"],
      "body+arms+legs": ["body", "lArm", "rArm", "lLeg", "rLeg"],
      full:            ["head", "body", "lArm", "rArm", "lLeg", "rLeg"],
    };
    const locs = coverageMap[result.coverage] ?? ["body"];
    for (const loc of locs) {
      ap[loc] = mat.ap;
      locations[loc] = true;
    }

    // Determine penalty based on piece type
    let penalty = "";
    if (result.piece.includes("Helm") && !result.piece.includes("Open")) penalty = "-20 Perception";
    else if (result.piece.includes("Open Helm") || result.piece.includes("Coif") || result.piece.includes("Skullcap")) penalty = "-10 Perception";
    else if (result.piece.includes("Leggings") || result.piece.includes("Chausses")) {
      if (result.material === "plate") penalty = "-10 Stealth";
    }

    // Build flaws — add "partial" for open helms, skullcaps, coifs
    const flaws = [...mat.flaws];
    if (result.piece.includes("Open Helm") || result.piece.includes("Skullcap") || result.piece.includes("Coif")) {
      flaws.push({"name": "partial"});
    }

    // Apply to parsed data
    if (!this.#parsedData.system) this.#parsedData.system = {};
    this.#parsedData.system.AP = ap;
    this.#parsedData.system.locations = locations;
    this.#parsedData.system.qualities = { value: [...mat.qualities] };
    this.#parsedData.system.flaws = { value: flaws };
    this.#parsedData.system.penalty = { value: penalty };

    // Update name and type
    this.#parsedData.name = result.piece;
    this.#parsedData.type = "armour";

    // Format material name for display
    const materialDisplay = result.material.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

    this.#appendDescription(
      `<p><strong>Random Armour Piece:</strong> ${result.piece} (d100: ${result.pieceRoll})</p>` +
      `<p><strong>Original Fit:</strong> ${result.species} (${result.height}) — d10 species: ${result.speciesRoll}, d10 height: ${result.heightRoll}</p>`
    );

    this.#rollResults.push({
      roll: result.pieceRoll,
      name: result.piece,
      description: `${materialDisplay} armour covering ${result.coverage}. Originally made for a ${result.height} ${result.species}. AP: ${mat.ap} per location.`,
    });
    this.render();
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /** Read the name input and apply it to the parsed data before creation */
  #applyNameOverride() {
    const nameInput = this.element.querySelector("#tb-item-name");
    const newName = nameInput?.value?.trim();
    if (newName && this.#parsedData) {
      this.#parsedData.name = newName;
    }
  }

  /** Ensure a quality exists on the item, adding it if missing */
  #ensureQuality(name, value) {
    if (!this.#parsedData?.system) return;
    if (!this.#parsedData.system.qualities) this.#parsedData.system.qualities = { value: [] };
    const quals = this.#parsedData.system.qualities.value;
    if (!quals.some((q) => q.name === name)) {
      quals.push(value !== undefined ? { name, value } : { name });
    }
  }

  /** Append HTML to the item description */
  #appendDescription(html) {
    if (!this.#parsedData?.system?.description) {
      this.#parsedData.system = this.#parsedData.system ?? {};
      this.#parsedData.system.description = { value: "" };
    }
    this.#parsedData.system.description.value += html;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function _formatLocations(locations) {
  if (!locations) return "None";
  const names = [];
  if (locations.head) names.push("Head");
  if (locations.body) names.push("Body");
  if (locations.lArm) names.push("L.Arm");
  if (locations.rArm) names.push("R.Arm");
  if (locations.lLeg) names.push("L.Leg");
  if (locations.rLeg) names.push("R.Leg");
  return names.length ? names.join(", ") : "None";
}

function _formatAP(ap) {
  if (!ap) return "0";
  const parts = [];
  const labels = { head: "Head", body: "Body", lArm: "L.Arm", rArm: "R.Arm", lLeg: "L.Leg", rLeg: "R.Leg" };
  for (const [key, label] of Object.entries(labels)) {
    if (ap[key] > 0) parts.push(`${label}: ${ap[key]}`);
  }
  return parts.length ? parts.join(", ") : "0";
}
