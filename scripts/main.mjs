// ===========================================================================
// WFRP4e Universal Trapping Builder - Main Entry Point
// ===========================================================================
import { TrappingBuilderApp } from "./trapping-builder-app.mjs";
import { registerSettings } from "./settings.mjs";

const MODULE_ID = "wfrp4e-trapping-builder";

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------
Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initialising Universal Trapping Builder`);
  registerSettings();
});

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Ready`);
});

// ---------------------------------------------------------------------------
// Inject "Create Trapping (AI)" button into the actor sheet Items tab
// FoundryVTT V13 fires renderActorSheetWFRP4eCharacter with native HTMLElement
// ---------------------------------------------------------------------------
Hooks.on("renderActorSheetWFRP4eCharacter", (app, html, data) => {
  _injectButton(app, html);
});

// Fallback for other V13 sheet variants
Hooks.on("renderActorSheetV2", (app, html, data) => {
  if (app.document?.type !== "character") return;
  _injectButton(app, html);
});

/**
 * Inject the "Create Trapping (AI)" button into the actor sheet's inventory
 * header area. V13 html is a native HTMLElement.
 */
function _injectButton(app, html) {
  // Ensure we're dealing with a native element (V13)
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root) return;

  // Don't double-inject
  if (root.querySelector(".trapping-builder-btn")) return;

  // Find the inventory / possessions tab content area
  // WFRP4e uses a tab with data-tab="trappings" or "possessions"
  const inventoryTab =
    root.querySelector('[data-tab="trappings"]') ??
    root.querySelector('[data-tab="possessions"]') ??
    root.querySelector('[data-tab="inventory"]');

  if (!inventoryTab) return;

  // Look for an existing header or control row to append to
  const headerRow =
    inventoryTab.querySelector(".tab-header") ??
    inventoryTab.querySelector(".items-header") ??
    inventoryTab.querySelector("header") ??
    inventoryTab;

  // Build the button
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "trapping-builder-btn";
  btn.dataset.tooltip = game.i18n.localize("TRAPPING_BUILDER.Description");
  btn.innerHTML = `<i class="fas fa-wand-magic-sparkles"></i> Create Trapping (AI)`;

  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    new TrappingBuilderApp({ actor: app.document }).render(true);
  });

  // Insert at beginning of header row
  if (headerRow.firstChild) {
    headerRow.insertBefore(btn, headerRow.firstChild);
  } else {
    headerRow.appendChild(btn);
  }
}

export { MODULE_ID };
