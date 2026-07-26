# ShowCall Companion Module

Control [ShowCall](https://github.com/trevormarrr/showcall)'s Resolume integration from a Stream Deck via Bitfocus Companion, with live feedback and preset buttons that stay in sync with whatever is actually configured in ShowCall.

**Version:** 2.3.0 | **License:** MIT | **Node.js:** 18.12+

## What this module actually does

This module talks to ShowCall's real WebSocket API at `ws://<host>:<port>/api/companion`. Every action, feedback, and variable below maps directly to something ShowCall's server actually implements - nothing here is aspirational.

### Actions
| Action | ShowCall command | Notes |
|---|---|---|
| Trigger Clip | `trigger_clip` | Fires `/composition/layers/{layer}/clips/{column}/connect` |
| Trigger Column | `trigger_column` | Fires `/composition/columns/{column}/connect` |
| Cut to Program | `cut_to_program` | Fires ShowCall's composition resync |
| Clear All | `clear_all` | Disconnects all clips |
| Execute Macro (raw steps) | `execute_macro` | Send your own `[{type, layer, column, ms}]` JSON steps |
| Execute ShowCall Preset | `execute_macro` (by `macroId`) | Runs a preset from ShowCall's **active bank** by ID |
| Refresh Status | `get_status` | Requests an immediate status snapshot |

ShowCall does **not** currently support stopping an individual clip/layer/column, setting BPM, tap tempo, or layer opacity over this API - so this module doesn't pretend to either. If those land in a future ShowCall release, they can be added here.

### Feedbacks
| Feedback | Type | Behavior |
|---|---|---|
| `connection_status` | boolean | Connected to ShowCall |
| `clip_active` | boolean | Given layer/column is live in program |
| `clip_preview` | boolean | Given layer/column is queued in Resolume (Previewed) |
| `layer_active` | boolean | Any clip live in the given layer |
| `column_active` | boolean | Any clip live in the given column |
| `any_clips_active` | boolean | At least one clip is live |
| `bpm_range` | boolean | Current BPM is within a min/max range |
| `preset_active` | boolean | Given preset ID is currently executing |
| `preset_style` | advanced | **Live-looks-up** a preset by ID and applies its current label/color, even on buttons placed a long time ago |

### Live preset sync (the important part)

Dynamic "ShowCall Presets" buttons are generated straight from whatever preset bank is active in ShowCall. This module keeps them in sync in three ways:

1. On connect, ShowCall sends the **currently active bank's** presets (not a stale legacy file).
2. Any time you save presets, switch banks, or clear a bank inside ShowCall, it broadcasts a fresh preset list over the WebSocket to every connected Companion instance.
3. Placed buttons use a live `preset_style` feedback keyed by preset **ID** (not array position), so if you rename a preset or change its color in ShowCall, already-placed Stream Deck buttons update automatically - no re-dragging required. If a preset is deleted, the button greys out and shows `(removed)` instead of silently going stale.

> These fixes required small corrections on the ShowCall server side too (it previously only pushed the legacy preset file on connect, and never broadcast on bank switch/clear). Make sure you're running an up-to-date ShowCall build that includes these companion-sync fixes.

### Variables

```
$(showcall:connection_status)        Connected / Disconnected
$(showcall:connection_uptime)        e.g. 4m 12s
$(showcall:bpm)                      Current BPM (or — if unknown)
$(showcall:composition_name)         Current Resolume composition name
$(showcall:showcall_host)            Host ShowCall reports itself as
$(showcall:program_clip_count)       Number of clips currently live
$(showcall:program_clip_names)       e.g. "L1C1:Intro, L2C3:Lower Third"
$(showcall:preview_clip)             Currently queued/selected clip, or "None"
$(showcall:active_layer_count)       Number of layers with a live clip
$(showcall:active_column_count)      Number of columns with a live clip
$(showcall:available_presets_count)  Presets in the active bank
$(showcall:active_preset_label)      Label of the currently executing preset
$(showcall:layer_N_status)           "Active (n)" / "Inactive" for layer N
$(showcall:layer_N_name)             Best-effort layer name (from an active clip)
$(showcall:clip_L_C_name)            Clip name at layer L / column C
$(showcall:preset_N_name)            Label of the Nth preset in the active bank
$(showcall:preset_N_id)              ID of the Nth preset in the active bank
```

`layer_N_*` and `clip_L_C_*` variables are only generated for the grid size you configure (see below) - ShowCall never tells Companion how many layers/columns a composition has, so this module can't know it automatically.

## Installation

### Prerequisites
- **Node.js 18.12+** ([Download](https://nodejs.org/))
- **Bitfocus Companion** (3.0+)
- **ShowCall 1.5.0+** with WebSocket support

### Quick Install

1. **Clone or download this repository:**
   ```bash
   git clone https://github.com/trevormarr/showcall-companion.git
   cd showcall-companion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add to Companion as a developer module:**
   - Open Bitfocus Companion
   - Go to **Settings** (gear icon) → **Developer modules**
   - Add this folder path
   - Restart Companion

4. **Add ShowCall connection:**
   - Go to **Connections** tab
   - Click **"+ Add Connection"**
   - Search for **ShowCall**
   - Configure:
     - **Host:** `localhost` (or your ShowCall machine IP)
     - **Port:** `3200` (default ShowCall companion port)
     - **Layers to expose / Columns to expose:** match how many you actually use
   - Click **Save**

For detailed installation instructions, see [INSTALL.md](INSTALL.md).

## Configuration

| Field | Default | Purpose |
|---|---|---|
| Host | `localhost` | Machine running ShowCall |
| Port | `3200` | ShowCall's companion WebSocket port |
| Layers to expose | `4` | How many layers get clip-trigger buttons/variables (1-8) |
| Columns to expose | `8` | How many columns get clip-trigger buttons/variables (1-32) |

Changing Layers/Columns regenerates the preset button grid and variable list immediately.

## Troubleshooting

**Can't connect to ShowCall**
- Confirm ShowCall is actually running and its companion WebSocket is up (check ShowCall's own logs for `Companion module connected`)
- If Companion and ShowCall are on different machines, use the actual IP, not `localhost`
- Confirm nothing else is bound to port 3200

**Preset buttons don't update after editing in ShowCall**
- Make sure you're running a ShowCall build that broadcasts on preset save/bank switch/bank clear (older builds only pushed presets on initial connect)
- Check the ShowCall console for `🎛️ Broadcasted preset sync` log lines when you save/switch/clear

**Feedback stops updating when ShowCall is minimized**
- Older ShowCall builds only sent status to Companion while the ShowCall UI's own dashboard was open. If you're still seeing this, update ShowCall - status is now polled independently of the UI whenever a Companion client is connected.

For additional troubleshooting, see the [INSTALL.md](INSTALL.md) guide.

## License

MIT © Trevor Marr
