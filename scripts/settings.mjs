// ===========================================================================
// Settings Registration & Sourcebook Detection
//
// This file handles two responsibilities:
//
// 1. SETTINGS REGISTRATION
//    Registers the module's configurable settings in FoundryVTT's module
//    settings panel. These include:
//    - apiKey: The user's Anthropic API key for Claude AI calls
//    - model: Which Claude model to use (Sonnet 4 or Haiku 4.5)
//    - defaultItemType: Default item type suggestion for the AI parser
//
// 2. SOURCEBOOK MODULE DETECTION
//    Determines which WFRP4e sourcebook modules are installed and active
//    in this Foundry world. The Trapping Builder gates certain features
//    behind sourcebook ownership:
//    - Archives of the Empire Vol II (wfrp4e-archives2):
//        Random magical weapon/armour/shield quality tables
//    - Dwarf Player's Guide (wfrp4e-dwarfs):
//        Dwarven Rune inscription system
//
//    If a sourcebook module is not active, its corresponding UI section
//    is hidden — the user can still generate items with the AI, just
//    without the supplemental random tables or rune features.
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

// ===========================================================================
// Sourcebook Module Detection
// Maps features to the Foundry module IDs of the sourcebooks that contain them.
// If a sourcebook module is not installed and active, its features are hidden.
// ===========================================================================

const SOURCEBOOK_MODULES = {
  archivesVol2: "wfrp4e-archives2",
  dwarfPlayersGuide: "wfrp4e-dwarfs",
};

/**
 * Check if a sourcebook module is installed and active.
 * @param {"archivesVol2"|"dwarfPlayersGuide"} sourcebook
 * @returns {boolean}
 */
export function isSourcebookActive(sourcebook) {
  const moduleId = SOURCEBOOK_MODULES[sourcebook];
  if (!moduleId) return false;
  return game.modules.get(moduleId)?.active ?? false;
}
