## ShowCall Companion Module

This module provides comprehensive control of ShowCall's Resolume integration via Stream Deck.

### Setup

1. **Install ShowCall**: Download and install ShowCall v1.5.0+ from GitHub
2. **Configure Connection**: Set the ShowCall server IP and port (default: localhost:3200)
3. **Verify Connection**: The connection status feedback will show green when connected

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

### Configuration

**Host**: IP address where ShowCall is running (default: localhost)
**Port**: ShowCall server port (default: 3200)

### Requirements

- ShowCall v1.5.0 or later with WebSocket support
- Network connectivity to ShowCall server
- Resolume Arena connected to ShowCall

### Troubleshooting

- **Connection Failed**: Verify ShowCall is running and port is correct
- **Commands Not Working**: Check ShowCall console for WebSocket connection logs
- **No Status Updates**: Ensure ShowCall has active Resolume connection

For support, visit: https://github.com/trevormarr/showcall-companion
