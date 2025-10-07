# ShowCall Companion Module

A Companion module for controlling ShowCall's Resolume integration via Stream Deck.

## Features

- **Clip Control**: Trigger individual clips by layer and column
- **Column Control**: Trigger entire columns
- **Transport**: Cut to Program, Clear All
- **Macro Support**: Execute custom ShowCall macros
- **Visual Feedback**: See which clips are currently active
- **Real-time Status**: Connection status and BPM display

## Installation

1. Copy this module to your Companion modules directory
2. Restart Companion
3. Add a new ShowCall instance
4. Configure the host/port to match your ShowCall server

## Configuration

- **Host**: IP address or hostname where ShowCall is running (default: localhost)
- **Port**: Port number of ShowCall server (default: 3200)

## Actions

### Trigger Clip
Triggers a specific clip by layer and column number.
- **Layer**: 1-8
- **Column**: 1-32

### Trigger Column
Triggers all clips in a specific column.
- **Column**: 1-32

### Cut to Program
Executes a cut operation (Resolume's tempo resync).

### Clear All
Disconnects all clips.

### Execute Macro
Runs a custom ShowCall macro by ID.

## Feedbacks

### Clip Active
Shows when a specific clip is active in the program output.

### Connection Status
Indicates whether the module is connected to ShowCall.

## Variables

- `connection_status`: Connected/Disconnected
- `bpm`: Current BPM from Resolume
- `program_clips`: Number of active clips
- `program_clip_names`: Names of active clips

## Presets

The module includes presets for:
- Basic transport controls (Cut, Clear All)
- Individual clip triggers for layers 1-4, columns 1-8
- Column triggers for columns 1-8

## Protocol

This module communicates with ShowCall via WebSocket at `/api/companion`. Commands are sent as JSON messages:

```json
{
  "command": "trigger_clip",
  "layer": 1,
  "column": 2
}
```

Status updates are received automatically:

```json
{
  "type": "status",
  "data": {
    "connected": true,
    "program": [{"layer": 1, "column": 2, "clipName": "Clip Name"}],
    "bpm": 120
  }
}
```

## Development

This module requires ShowCall version 1.0+ with Companion WebSocket support enabled.

## License

MIT# showcall-companion
