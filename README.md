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

### Method 1: Manual Installation (Recommended)
1. Download this module as a ZIP file from GitHub
2. Extract to your Companion modules directory:
   - **Windows**: `%APPDATA%/companion-modules/`
   - **macOS**: `~/Documents/companion-modules/`
   - **Linux**: `~/.companion-modules/`
3. Restart Companion
4. Add a new ShowCall instance

### Method 2: Development Installation
```bash
git clone https://github.com/trevormarr/showcall-companion.git
cd showcall-companion
npm install
# Copy to your Companion modules directory
```

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
