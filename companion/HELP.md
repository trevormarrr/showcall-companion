## ShowCall Companion Module

This module provides comprehensive control of ShowCall's Resolume integration via Stream Deck.

### Installation Instructions

### Step 1: Start ShowCall with WebSocket Support
1. Make sure you have ShowCall v1.5.0 or later
2. Start ShowCall - it will automatically start the WebSocket server for Companion integration

### Step 2: Install the Module in Companion

### Requirements Before Installation

**Node.js**: You need Node.js installed on your system to run `npm install`
- Download from: https://nodejs.org/
- Minimum version: 18.12 or higher
- Companion requires Node.js to run modules with dependencies

**IMPORTANT: Install Dependencies First**
1. Download or clone this repository: `https://github.com/trevormarrr/showcall-companion`
2. Open a terminal/command prompt in the module folder
3. Run: `npm install` (this installs required dependencies)
4. Wait for installation to complete

**Method 1: Developer Module (Recommended)**
1. After npm install completes, open Bitfocus Companion
2. Click the **Settings** (cog) icon in the top-right corner
3. Go to the **Developer modules** section
4. Click **Add module**
5. Select the folder containing this module (should contain `main.js`, `manifest.json`, `node_modules`, etc.)
6. Click **Save**
7. **Restart Companion completely** (close and reopen the application)

**Step 3: Add Connection**
1. In Companion, click **Connections** in the sidebar
2. Click the **+** button to add new connection
3. Search for "ShowCall" and select it
4. Configure settings (see Configuration section below)

### Configuration

**Host**: IP address where ShowCall is running
- Local: `127.0.0.1` or `localhost`
- Network: Use the actual IP address of the ShowCall machine

**Port**: ShowCall WebSocket port (default: `3200`)
- This should match the PORT in ShowCall's .env file

### Setup

1. **Install ShowCall**: Download and install ShowCall v1.5.0+ from GitHub
2. **Start ShowCall**: Launch the application (WebSocket server starts automatically)
3. **Configure Connection**: Set the ShowCall server IP and port in Companion
4. **Verify Connection**: The connection status feedback will show green when connected

### Actions

**Trigger Clip**: Fire individual clips by layer (1-8) and column (1-32)
**Trigger Column**: Fire all clips in a specific column (1-32)
**Cut to Program**: Execute a cut operation (Resolume tempo resync)
**Clear All**: Disconnect all active clips
**Execute Macro (raw steps)**: Run custom macro steps as JSON (trigger/triggercolumn/cut/clear/sleep)
**Execute ShowCall Preset**: Run a preset from ShowCall's active bank by its ID
**Refresh Status**: Request an immediate status snapshot from ShowCall

ShowCall does not currently support stopping an individual clip/layer/column, BPM control, or layer opacity over this API, so those are not offered here.

### Feedbacks

**Connection Status**: Green when connected to ShowCall
**Clip Active**: Red when a specific layer/column clip is live in program
**Clip in Preview**: Gray when a clip is queued/selected in Resolume but not yet triggered
**Layer Active / Column Active**: Orange/blue when any clip is live in that layer/column
**Any Clips Active**: Purple when at least one clip is live
**BPM in Range**: Green when current BPM falls within a configured range
**Preset Executing**: Orange while a given preset ID is actively running
**ShowCall Preset Style (live)**: Looks up a preset by ID every update and applies its current label/color - this is what keeps dynamic preset buttons accurate without re-dragging them

### Preset Sync

Dynamic "ShowCall Presets" buttons reflect whatever bank is currently active in ShowCall. ShowCall pushes a fresh preset list to Companion whenever you save presets, switch banks, or clear a bank - no reconnect needed. Buttons are keyed by preset ID, so renaming/recoloring a preset updates already-placed buttons live.

### Variables

- `connection_status` / `connection_uptime`
- `bpm`, `composition_name`, `showcall_host`
- `program_clip_count`, `program_clip_names`, `preview_clip`
- `active_layer_count`, `active_column_count`
- `available_presets_count`, `active_preset_label`
- `layer_N_status`, `layer_N_name` (per configured layer)
- `clip_L_C_name` (per configured layer/column)
- `preset_N_name`, `preset_N_id` (per preset slot in the active bank)

### Troubleshooting

**Module Not Appearing in Connections**
- Ensure all files are copied to the module folder
- Check that `manifest.json` exists in the `companion/` subfolder
- Restart Companion completely (close and reopen)
- Check Companion logs for error messages

**Module Loading Errors** 
- Error "Failed to get module api version": Dependencies issue, try re-downloading module
- Error "Cannot find module": Ensure all files are present and Node.js is installed
- Try removing and re-adding the developer module

**Connection Issues**
- **Connection Failed**: Verify ShowCall is running and accessible
- **Wrong Port**: Check ShowCall's .env file for correct PORT setting
- **Network Issues**: Test by opening ShowCall's web interface in browser
- **Firewall**: Ensure port is open for WebSocket connections

**Commands Not Working**
- Check ShowCall console for WebSocket connection logs
- Verify Resolume is connected to ShowCall
- Ensure clip coordinates are valid (layer 1-8, column 1-32)

**No Status Updates**
- Ensure ShowCall has active Resolume connection
- Check WebSocket connection is established
- Verify ShowCall is receiving status from Resolume

### Requirements

- ShowCall v1.5.0 or later with WebSocket support
- Network connectivity to ShowCall server
- Resolume Arena connected to ShowCall
- Bitfocus Companion 3.0+

For support, visit: https://github.com/trevormarrr/showcall-companion
