## ShowCall Companion Module

This module provides comprehensive control of ShowCall's Resolume integration via Stream Deck.

### Installation

**Step 1: Download Module**
- Download from: https://github.com/trevormarrr/showcall-companion
- Or clone: `git clone https://github.com/trevormarrr/showcall-companion.git`

**Step 2: Install in Companion**
1. Open Bitfocus Companion
2. Click the **Settings** (cog/gear) icon in the top-right
3. Select **Developer modules** from the sidebar
4. Click **Add module**
5. Browse to and select the `showcall-companion` folder
6. Click **Save**
7. **IMPORTANT**: Completely restart Companion (close and reopen)

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
**Execute Macro**: Run custom ShowCall macros by ID

### Feedbacks

**Clip Active**: Shows red background when a specific clip is active in program
**Connection Status**: Shows green when connected to ShowCall server

### Variables

- `connection_status`: Connected/Disconnected
- `bpm`: Current BPM from Resolume
- `program_clips`: Number of active clips
- `program_clip_names`: Comma-separated list of active clip names

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
