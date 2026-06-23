// ===========================================================================
// WFRP4e Universal Trapping Builder - Main Entry Point
//
// This is the module's entry point, loaded by FoundryVTT when the module
// is active (referenced in module.json as an esmodule).
//
// RESPONSIBILITIES:
//   1. Register module settings on the "init" hook (API key, model, defaults)
//   2. Inject a "Create Trapping (AI)" button into the Items Directory
//      sidebar tab on the "renderItemDirectory" hook
//   3. When clicked, open the TrappingBuilderApp window
//
// The sidebar button is placed alongside Foundry's native "Create Item"
// and "Create Folder" buttons. The injection handles multiple possible
// DOM structures across FoundryVTT versions (V13 uses .header-actions,
// earlier versions use .action-buttons or .directory-header).
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
// Inject "Create Trapping (AI)" button into the Items Directory sidebar tab.
// This sits alongside the existing "Create Item" and "Create Folder" buttons.
//
// V14: Sidebar tabs are ApplicationV2-based. The hook signature is
//       renderItemDirectory(app, element, data) where element is an HTMLElement.
// V13: Similar pattern — element can be HTMLElement or jQuery-wrapped.
// ---------------------------------------------------------------------------
Hooks.on("renderItemDirectory", (app, html, data) => {
  _injectSidebarButton(html);
});

/**
 * Inject the "Create Trapping (AI)" button into the Items sidebar directory
 * header action buttons area, next to "Create Item" and "Create Folder".
 *
 * Handles multiple possible DOM structures:
 * - V14: .header-actions within the ApplicationV2 sidebar tab
 * - V13: .header-actions or .action-buttons
 * - Older/fallback: .directory-header or .directory-footer
 */
function _injectSidebarButton(html) {
  // Normalize: V14 passes HTMLElement, V13 may pass HTMLElement or jQuery
  const root = html instanceof HTMLElement ? html : html[0] ?? html;
  if (!root) return;

  // Don't double-inject
  if (root.querySelector(".trapping-builder-btn")) return;

  // V14 sidebar directories may use different selectors for the button area.
  // Try multiple selectors in order of priority to find the best injection point.
  const actionBar =
    root.querySelector(".header-actions") ??
    root.querySelector(".header-controls") ??
    root.querySelector(".action-buttons") ??
    root.querySelector(".directory-header .header-control") ??
    root.querySelector(".directory-header");

  if (!actionBar) {
    const footer = root.querySelector(".directory-footer");
    if (footer) {
      footer.appendChild(_createButton());
      return;
    }
    console.warn(`${MODULE_ID} | Could not find Items directory action bar to inject button.`);
    return;
  }

  actionBar.appendChild(_createButton());
}

/**
 * Build the "Create Trapping (AI)" button element.
 */
function _createButton() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "trapping-builder-btn";
  btn.dataset.tooltip = game.i18n.localize("TRAPPING_BUILDER.Description");
  btn.innerHTML = `<i class="fas fa-wand-magic-sparkles"></i> Create Trapping (AI)`;

  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    new TrappingBuilderApp().render({force: true});
  });

  return btn;
}

export { MODULE_ID };
