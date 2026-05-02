# ShowCall Companion Module

Control ShowCall's Resolume integration directly from Stream Deck via Bitfocus Companion with comprehensive feedback system, real-time sync, and professional preset management.

**Version:** 2.2.0 | **License:** MIT | **Node.js:** 18.12+

## Features

### Core Capabilities
- **Real-time ShowCall Integration**: Seamless control via WebSocket connection
- **Comprehensive Feedback System**: Visual feedback for all ShowCall states
  - Clip activity (Red background)
  - Layer status (Orange background)
  - Column activity (Blue background)
  - Connection status (Green background)
  - BPM range matching (Green when in range)
  - Clip opacity and position visualization
  
- **Dynamic Controls**
  - Individual clip triggers with stop functionality
  - Layer and column control (start/stop)
  - BPM control with tap tempo
  - Layer opacity adjustment
  - Cut/Clear All operations
  - Composition resync

### Preset System
- **Automatic Preset Sync**: Dynamic preset button generation from ShowCall data
- **Real-time Updates**: Presets update instantly when created/modified in ShowCall
- **Visual Feedback**: Color-coded buttons with automatic text contrast adjustment
- **Scene Macros**: 8 pre-configured scenes (Walk-In, Sermon, Baptism, Closing, Worship, Prayer, Offering, Announce)

### Advanced Monitoring
- **Connection Health**: Real-time status with automatic retry logic
- **Performance Tracking**: Monitor active clips, layers, and columns
- **Live Variables**: 
  - Connection status and uptime
  - Real-time BPM display
  - Active clip counts and names
  - Composition information
  - Individual layer status

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
   - Click **Save**

### Supported Installation Methods
- **Developer Module** (Recommended for development)
- **Direct Module Installation** (Copy to Companion modules directory)
- **Docker** (If running Companion in Docker)

For detailed installation instructions, see [INSTALL.md](INSTALL.md).

## Available Actions

### Clip Control
- **Play Clip**: Trigger a specific clip by layer and column
- **Stop Clip**: Stop a specific clip
- **Toggle Clip**: Toggle a clip on/off

### Layer Control
- **Start Layer**: Start all clips in a layer
- **Stop Layer**: Stop all clips in a layer
- **Set Layer Opacity**: Adjust layer opacity (0-100%)

### Column Control
- **Start Column**: Start all clips in a column
- **Stop Column**: Stop all clips in a column

### Global Control
- **Cut**: Perform a cut to program
- **Clear All**: Stop all playing clips
- **Tap Tempo**: Set BPM by tapping
- **Set BPM**: Set BPM to specific value
- **Resync**: Force composition resync with ShowCall

### Preset Control
- **Execute Preset**: Run a ShowCall preset by ID
- **Execute Macro**: Run a scene macro

## Available Feedbacks

Configure visual feedback on your buttons:

| Feedback | Behavior | Color |
|----------|----------|-------|
| `clip_active` | Specific clip is playing | Red |
| `layer_active` | Layer has active clips | Orange |
| `column_active` | Column has active clips | Blue |
| `connection_status` | Connected to ShowCall | Green |
| `any_clips_active` | Any clips playing | Purple |
| `bpm_range` | BPM in specified range | Green |
| `clip_opacity_level` | Clip opacity visualization | Brightness |
| `clip_preview` | Clip in preview mode | Gray |
| `preset_active` | Preset executing | Orange |

## Available Variables

Display live ShowCall data on buttons:

```
$(showcall:connection_status)      - Connected/Disconnected
$(showcall:bpm)                    - Current BPM value
$(showcall:program_clips)          - Count of active clips
$(showcall:program_clip_names)     - Names of active clips
$(showcall:composition_name)       - Current composition name
$(showcall:active_layers)          - Count of active layers
$(showcall:active_columns)         - Count of active columns
$(showcall:layer_1_status)         - Layer 1 status (Inactive/Active)
...and so on for all 8 layers
```

## Troubleshooting

### Connection Issues
**Problem**: "Cannot connect to ShowCall"
- Verify ShowCall is running on the specified host/port
- Check firewall isn't blocking port 3200
- Try `localhost` if both are on same machine
- Verify ShowCall version is 1.5.0+

**Problem**: "Module not found" error
- Run `npm install` in the module folder
- Restart Companion after installation
- Check that all files are present

### Feedback Not Working
- Verify connection is active (green status)
- Refresh Companion connection
- Clear button cache in Companion settings
- Check browser console for errors

### Preset Sync Issues
- Restart Companion connection to ShowCall
- Verify WebSocket is enabled in ShowCall
- Check Companion and ShowCall are on same network

For additional troubleshooting, see the [INSTALL.md](INSTALL.md) guide.

## Configuration Reference

### ShowCall Connection Settings
- **Host**: IP address or hostname of ShowCall (default: `localhost`)
- **Port**: WebSocket port (default: `3200`)
- **Auto-reconnect**: Enabled by default with 10 retry attempts

### Advanced Options
- **Feedback Update Interval**: Real-time (no delay)
- **Connection Timeout**: 5 seconds
- **Maximum Retry Attempts**: 10 (approximately 30 seconds total)