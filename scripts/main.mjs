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
// Inject "Create Trapping (AI)" button into the Items Directory sidebar tab.
// This sits alongside the existing "Create Item" and "Create Folder" buttons.
// ---------------------------------------------------------------------------
Hooks.on("renderItemDirectory", (app, html, data) => {
  _injectSidebarButton(html);
});

/**
 * Inject the "Create Trapping (AI)" button into the Items sidebar directory
 * header action buttons area, next to "Create Item" and "Create Folder".
 */
function _injectSidebarButton(html) {
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root) return;

  // Don't double-inject
  if (root.querySelector(".trapping-builder-btn")) return;

  // V13 sidebar directories use .header-actions or .action-buttons for the
  // button row containing "Create Item", "Create Folder", etc.
  const actionBar =
    root.querySelector(".header-actions") ??
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
    new TrappingBuilderApp().render(true);
  });

  return btn;
}

export { MODULE_ID };
