# WFRP4e Universal Trapping Builder

AI-powered trapping builder for [Warhammer Fantasy Roleplay 4th Edition](https://foundryvtt.com/packages/wfrp4e) on [FoundryVTT](https://foundryvtt.com/) V13+.

Describe any item in plain English and generate a fully functional WFRP4e trapping with active effects — consumables, equipment, enchanted gear, weapons, armour, and more.

## Features

- **Plain-English Input** — Type a description like *"Potion of Bull's Strength: +20 Strength for 3 rounds"* and the module generates a complete item with scripted effects.
- **All Item Types** — Trappings, weapons, armour, ammunition, containers, and more.
- **Full Effect Support** — Characteristic modifiers, skill bonuses, SL bonuses, conditions, healing, movement, fate/fortune/resolve/resilience, advantage, and custom scripts.
- **Preview Before Creating** — See the generated item card with all effects and scripts before committing.
- **Create to World or Actor** — Add the item to the Items directory or directly to an actor's inventory.

## Requirements

- FoundryVTT V13+
- WFRP4e system v8.0.0+
- An [Anthropic API key](https://console.anthropic.com/) (for AI-powered parsing)

## Installation

### Manifest URL (Forge VTT / FoundryVTT)

Use this manifest URL in **Add-on Modules → Install Module → Manifest URL**:

```
https://github.com/JeramieBrown/wfrp4e-trapping-builder/releases/latest/download/module.json
```

### Manual

1. Download the latest `wfrp4e-trapping-builder.zip` from [Releases](https://github.com/JeramieBrown/wfrp4e-trapping-builder/releases).
2. Extract into your `Data/modules/` directory.
3. Enable the module in your world's **Module Management** settings.

## Setup

1. Enable the module in your world.
2. Go to **Game Settings → Module Settings → WFRP4e Universal Trapping Builder**.
3. Enter your **Anthropic API key** (get one at [console.anthropic.com](https://console.anthropic.com/)).
4. Optionally choose a Claude model (Sonnet 4 recommended for quality, Haiku 4.5 for speed/cost).

## Usage

1. Open a character sheet and go to the **Trappings** tab.
2. Click the **Create Trapping (AI)** button.
3. Describe the item you want in plain English.
4. Click **Generate Trapping** — the AI will parse your description into a fully structured WFRP4e item.
5. Review the preview (item details, effects, scripts).
6. Click **Create Item** (adds to world Items) or **Add to Actor** (adds directly to the character).

### Example Prompts

- `Potion of Bull's Strength: +20 Strength for 3 rounds`
- `Enchanted Shield: +10 WS when parrying, adds 1 AP to all locations`
- `Healing Draught: restores 8 wounds when consumed`
- `Cloak of Shadows: +20 Stealth, +1 SL on Stealth tests`
- `Warpstone Amulet: +2 Advantage on use, adds 1 Corruption point`
- `Blessed Talisman of Sigmar: +10 WP, +1 Fortune point when equipped`
- `Masterwork Zweihander: two-handed sword, damage +2, reach long, +10 WS`

## Releasing a New Version

1. Update `version` in `module.json`.
2. Commit, tag, and push:
   ```bash
   git add -A
   git commit -m "Release v0.2.0"
   git tag v0.2.0
   git push origin main --tags
   ```
3. Run the GitHub Actions release workflow (or create a release manually):
   - Upload `module.json` as a release asset.
   - Upload `wfrp4e-trapping-builder.zip` as a release asset.

## License

MIT — see [LICENSE](LICENSE).
