# companion-module-showcall

Professional Stream Deck control for ShowCall's Resolume integration.

## Features

- **Clip Control**: Trigger individual clips by layer and column
- **Column Control**: Trigger entire columns  
- **Transport**: Cut to Program, Clear All
- **Macro Support**: Execute custom ShowCall macros
- **Visual Feedback**: See which clips are currently active
- **Real-time Status**: Connection status and BPM display

## Installation

### Method 1: Using Companion Developer Modules (Recommended)

1. **Download Module**:
   - Go to https://github.com/trevormarr/showcall-companion
   - Click "Code" → "Download ZIP"
   - Extract the ZIP file

2. **Setup Developer Modules in Companion**:
   - Open Companion
   - In the launcher window, click the **cog icon** in the top right corner
   - Click "Select" next to "Developer modules path"
   - Choose or create a folder (e.g., `companion-modules-dev`)
   - Copy the extracted `showcall-companion` folder into this directory

3. **Launch Companion**:
   - Click "Launch GUI" in the Companion launcher
   - The ShowCall module should appear in the connections list

4. **Add ShowCall Connection**:
   - Go to "Connections" tab
   - Click "Add Connection"
   - Find "ShowCall" in the list
   - Configure host/port settings

### Method 2: Manual Installation (Alternative)
If you prefer the traditional approach:
- Copy module to your system's modules directory
- **Windows**: Place in modules folder accessible to Companion
- **macOS/Linux**: Follow Companion's module loading documentation

## Configuration

- **Host**: IP address where ShowCall is running (default: localhost)
- **Port**: ShowCall server port (default: 3200)

## Requirements

- ShowCall v1.5.0 or later with WebSocket support
- Companion v3.0+
- Network connectivity to ShowCall server

## Support

For help and documentation, see [HELP.md](./companion/HELP.md) or visit:
- GitHub Issues: https://github.com/trevormarr/showcall-companion/issues
- ShowCall Repository: https://github.com/trevormarrr/showcall

## License

MIT - See [LICENSE](./LICENSE)
