// ===========================================================================
// Settings Registration
// ===========================================================================
const MODULE_ID = "wfrp4e-trapping-builder";

export function registerSettings() {
  game.settings.register(MODULE_ID, "apiKey", {
    name: game.i18n.localize("TRAPPING_BUILDER.Settings.ApiKey.Name"),
    hint: game.i18n.localize("TRAPPING_BUILDER.Settings.ApiKey.Hint"),
    scope: "world",
    config: true,
    type: String,
    default: "",
    requiresReload: false,
  });

  game.settings.register(MODULE_ID, "model", {
    name: game.i18n.localize("TRAPPING_BUILDER.Settings.Model.Name"),
    hint: game.i18n.localize("TRAPPING_BUILDER.Settings.Model.Hint"),
    scope: "world",
    config: true,
    type: String,
    default: "claude-sonnet-4-20250514",
    choices: {
      "claude-sonnet-4-20250514": "Claude Sonnet 4",
      "claude-haiku-4-5-20251001": "Claude Haiku 4.5",
    },
    requiresReload: false,
  });

  game.settings.register(MODULE_ID, "defaultItemType", {
    name: game.i18n.localize("TRAPPING_BUILDER.Settings.DefaultItemType.Name"),
    hint: game.i18n.localize("TRAPPING_BUILDER.Settings.DefaultItemType.Hint"),
    scope: "world",
    config: true,
    type: String,
    default: "trapping",
    choices: {
      trapping: "Trapping",
      weapon: "Weapon",
      armour: "Armour",
      ammunition: "Ammunition",
      container: "Container",
    },
    requiresReload: false,
  });
}
