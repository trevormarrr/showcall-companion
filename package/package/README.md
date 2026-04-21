# ShowCall Companion Module v2.0

🚀 **MAJOR UPDATE** - Control ShowCall's Resolume integration directly from Stream Deck via Bitfocus Companion with comprehensive feedback system and enhanced visual states.

## 🎯 Latest Updates in v2.0

### ✅ **Comprehensive Feedback System**
- **Clip Active**: Red background when specific clips are active ✨
- **Layer Status**: Orange background when any clips are active in a layer ✨
- **Column Status**: Blue background when any clips are active in a column ✨
- **Connection Status**: Green background when connected to ShowCall ✨
- **Any Clips Active**: Purple background when any clips are running ✨
- **BPM Range**: Green background when BPM is within specified range ✨
- **Clip Opacity**: Button brightness reflects clip opacity levels ✨
- **Clip Position**: Color gradients show clip playback progress ✨

### ✅ **Enhanced Actions & Controls**
- Individual clip triggers with stop functionality
- Layer and column control (start/stop)
- BPM control and tap tempo
- Layer opacity adjustment
- Enhanced macro system with 8 preset scenes
- Composition resync functionality
- Real-time status updates

### ✅ **Advanced Presets Collection**
- **Individual Clip Controls** (L1-L4, C1-C8) with multi-layered feedback
- **Column Triggers** (C1-C8) with active state indication
- **Layer Status Indicators** (L1-L8) with real-time clip counts
- **Enhanced Basic Controls** (Cut, Clear All, Tap Tempo, Resync)
- **Scene Macros** (8 presets: Walk-In, Sermon, Baptism, Closing, Worship, Prayer, Offering, Announce)
- **BPM Control Presets** (Slow, Normal, Fast, Very Fast)
- **System Status Display** with live connection and clip information

### ✅ **Rich Variable System**
- Connection status and uptime tracking
- Real-time BPM display
- Active clip counts and names
- Composition information
- Individual layer status variables
- Enhanced system monitoring

## Key Features

### 🎮 **Stream Deck Integration**
- **Smart Visual Feedback**: Buttons change colors based on ShowCall state
- **Real-time Updates**: Instant visual feedback when clips/layers change
- **Multi-layered Feedback**: Multiple feedback types per button
- **Variable Integration**: Live data display using Companion variables
- **Professional Presets**: Ready-to-use button layouts for common scenarios

### 🎵 **ShowCall Control**
- **Clip Management**: Trigger, stop, and monitor individual clips
- **Layer Control**: Manage entire layers with opacity control
- **Column Operations**: Trigger and stop entire columns
- **Scene Macros**: Execute complex scene changes instantly
- **BPM Sync**: Control and monitor tempo with tap tempo
- **Cut/Clear Operations**: Professional broadcast-style controls

### 📊 **Advanced Monitoring**
- **Connection Health**: Real-time connection status with retry logic
- **Performance Tracking**: Monitor active clips, layers, and columns
- **State Persistence**: Maintains state across disconnections
- **Error Handling**: Comprehensive error reporting and recovery

## Quick Installation

### Prerequisites
- Node.js 18.12+ installed ([Download here](https://nodejs.org/))
- Bitfocus Companion installed
- ShowCall v1.5.0+ running

### Automated Installation
1. Download this repository (Code → Download ZIP or `git clone`)
2. **Windows**: Double-click `install.bat`
3. **Mac/Linux**: Run `./install.sh` in terminal
4. Follow the on-screen instructions

### Manual Installation
```bash
# 1. Download/clone this repository
git clone https://github.com/trevormarrr/showcall-companion.git
cd showcall-companion

# 2. Install dependencies (REQUIRED!)
npm install

# 3. Add to Companion:
# - Open Companion Settings → Developer modules
# - Add this folder
# - Restart Companion
# - Add ShowCall connection
```

## Setup & Configuration

### 1. ShowCall Connection
- **Host**: Usually `localhost` (if Companion and ShowCall are on same machine)
- **Port**: Default `3200` (matches ShowCall's companion port)

### 2. Using Presets
1. Open Companion's **Buttons** tab
2. Navigate to **Presets** → **ShowCall**
3. Drag presets to your Stream Deck buttons
4. Enjoy instant visual feedback!

### 3. Custom Button Setup
Use these feedback types for custom buttons:

#### **Basic Feedbacks**
- `clip_active`: Red when specific clip is active
- `layer_active`: Orange when layer has active clips  
- `column_active`: Blue when column has active clips
- `connection_status`: Green when connected to ShowCall
- `any_clips_active`: Purple when any clips are running

#### **Advanced Feedbacks**
- `bpm_range`: Green when BPM is within specified range
- `clip_opacity_level`: Button brightness reflects clip opacity
- `clip_position`: Color gradient shows playback progress
- `clip_preview`: Gray when clip is in preview mode

#### **Available Variables**
```
$(showcall:connection_status)     - Connected/Disconnected
$(showcall:bpm)                   - Current BPM
$(showcall:program_clips)         - Number of active clips
$(showcall:program_clip_names)    - Names of active clips
$(showcall:composition_name)      - Current composition name
$(showcall:active_layers)         - Number of active layers
$(showcall:active_columns)        - Number of active columns
$(showcall:layer_1_status)        - Layer 1 status (Inactive/Active(#))
$(showcall:layer_2_status)        - Layer 2 status
...and so on for all 8 layers
```

## Button Categories Explained

### **Basic Controls**
- **CUT**: Instantly cut to program (with connection feedback)
- **CLEAR ALL**: Stop all clips (changes color when clips are active)
- **TAP TEMPO**: Set BPM by tapping (shows current BPM, green when in range)
- **RESYNC**: Force resync with ShowCall

### **Layer Controls (L1-L4)**
Individual clip buttons with sophisticated feedback:
- **Default**: Dark gray background
- **Active**: Red background with white text
- **Opacity**: Brightness varies with clip opacity
- **Multi-feedback**: Combines multiple visual states

### **Column Controls (C1-C8)**
Trigger entire columns with activity feedback:
- **Default**: Dark blue background
- **Active**: Bright blue when any clips in column are active

### **Layer Status (L1-L8)**
Monitor layer activity with click-to-stop:
- **Default**: Dark gray with variable text showing clip count
- **Active**: Orange background when layer has active clips
- **Interactive**: Click to stop all clips in layer

### **Scene Macros**
Pre-configured scene buttons with connection awareness:
- **Walk-In**: Light blue - Service opening
- **Sermon**: Green - Teaching time  
- **Baptism**: Purple - Special ceremonies
- **Closing**: Orange - Service ending
- **Worship**: Red - Music worship
- **Prayer**: Purple - Prayer time
- **Offering**: Green - Collection time
- **Announce**: Red - Announcements

### **BPM Control**
Quick BPM selection with range feedback:
- **Slow (100)**: For contemplative moments
- **Normal (120)**: Standard tempo
- **Fast (140)**: Energetic worship
- **Very Fast (160)**: High-energy moments
- **Feedback**: Green when current BPM matches selection

### **System Status**
Live dashboard button showing:
- Connection status
- Number of active clips
- Number of active layers
- Color changes based on system state

## Troubleshooting

### "Cannot find module" Error
If you see: `Failed to get module api version: Error: Cannot find module '@companion-module/base/package.json'`

**Solution**: You need to run `npm install` in the module folder BEFORE adding it to Companion.

**Steps**:
1. Download the module
2. Open terminal/command prompt in the module folder  
3. Run: `npm install`
4. Wait for completion
5. Then add to Companion as developer module

### Feedback Not Working
1. **Check Connection**: Ensure ShowCall is running and accessible
2. **Check Port**: Verify ShowCall companion port (default 3200)
3. **Restart Module**: Remove and re-add the ShowCall connection in Companion
4. **Check Logs**: Look at Companion logs for WebSocket errors

### Performance Issues
1. **Reduce Presets**: Start with fewer buttons and add gradually
2. **Check Network**: Ensure stable connection between Companion and ShowCall
3. **Monitor Resources**: ShowCall + Companion can be resource intensive

## Advanced Usage

### Creating Custom Workflows
Combine multiple feedback types on single buttons:
```javascript
// Example: Clip button with activity, opacity, and connection feedback
feedbacks: [
  { feedbackId: 'clip_active', options: { layer: 1, column: 1 } },
  { feedbackId: 'clip_opacity_level', options: { layer: 1, column: 1 } },
  { feedbackId: 'connection_status', options: {} }
]
```

### Variable-Rich Button Text
Create dynamic button labels:
```
Text: "L1C1\\n$(showcall:layer_1_status)"
Result: Shows "L1C1" and "Active (2)" or "Inactive"
```

## What's Next?

See [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md) for planned enhancements including:
- Custom button icons and animations
- Audio-reactive feedback
- Multi-user control
- Cloud sync
- AI-powered scene suggestions
- Mobile companion apps

## Support

- **Issues**: [GitHub Issues](https://github.com/trevormarrr/showcall-companion/issues)
- **Discussions**: [GitHub Discussions](https://github.com/trevormarrr/showcall-companion/discussions)
- **Email**: trevormarrr@users.noreply.github.com

---

**ShowCall Companion v2.0** - Professional-grade Stream Deck control for ShowCall Resolume integration. Built for churches, venues, and content creators who demand reliable, intuitive control.

*© 2024 Trevor Marr - MIT License*