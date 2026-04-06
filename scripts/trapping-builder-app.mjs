// ===========================================================================
// TrappingBuilderApp – ApplicationV2 + HandlebarsApplicationMixin (V13)
// ===========================================================================
import { parseTrappingDescription } from "./ai-parser.mjs";
import {
  createWorldItem,
  createActorItem,
  buildPreviewSummary,
} from "./item-factory.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class TrappingBuilderApp extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  // -----------------------------------------------------------------------
  // Static configuration
  // -----------------------------------------------------------------------
  static DEFAULT_OPTIONS = {
    id: "trapping-builder",
    classes: ["trapping-builder-app", "wfrp4e"],
    tag: "div",
    window: {
      title: "TRAPPING_BUILDER.Title",
      icon: "fas fa-wand-magic-sparkles",
      resizable: true,
    },
    position: {
      width: 560,
      height: "auto",
    },
    actions: {
      generate: TrappingBuilderApp.#onGenerate,
      reset: TrappingBuilderApp.#onReset,
      createWorld: TrappingBuilderApp.#onCreateWorld,
      createActor: TrappingBuilderApp.#onCreateActor,
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
                maxAP: this.#parsedData.system?.maxAP?.value ?? 0,
                penalty: this.#parsedData.system?.penalty?.value ?? 0,
                locationList: _formatLocations(
                  this.#parsedData.system?.locations
                ),
              }
            : null,
      };
    }

    return {
      description: this.#description,
      generating: this.#generating,
      error: this.#error,
      preview,
      actorName: this.#actor?.name ?? null,
    };
  }

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------
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
    this.render();
  }

  static async #onCreateWorld(event, target) {
    if (!this.#parsedData) return;

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
    if (!this.#parsedData || !this.#actor) return;

    try {
      const item = await createActorItem(this.#actor, this.#parsedData);
      ui.notifications.info(
        `${game.i18n.localize("TRAPPING_BUILDER.Success")} Added "${item.name}" to ${this.#actor.name}.`
      );
    } catch (err) {
      console.error("Trapping Builder | Creation failed:", err);
      ui.notifications.error(`Failed to add item: ${err.message}`);
    }
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
