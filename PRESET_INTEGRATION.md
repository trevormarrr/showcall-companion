# ShowCall Companion - Preset Integration

## Overview

This Companion module automatically integrates with ShowCall presets, creating dynamic Stream Deck buttons for any presets you create in the ShowCall app.

## New Features

### 🎯 Automatic Preset Buttons

When you create or modify presets in ShowCall, this module automatically:
- Creates Stream Deck buttons in the "ShowCall Presets" category
- Uses the colors and labels from your ShowCall presets
- Updates existing buttons when presets are modified
- Removes buttons when presets are deleted

### 🎬 New Action: Execute ShowCall Preset

**Action ID**: `execute_preset`

Execute a preset by its ID from ShowCall.

**Options**:
- `preset_id` (text): The ID of the preset as defined in ShowCall

**Example**:
```json
{
  "actionId": "execute_preset",
  "options": {
    "preset_id": "worship_intro"
  }
}
```

### 📡 Real-Time Preset Sync

The module listens for preset updates via WebSocket:

```javascript
// When ShowCall sends preset updates
{
  "type": "presets_updated",
  "data": [
    {
      "id": "worship_intro",
      "label": "Worship Intro",
      "color": "#e11d48",
      "macro": [...]
    }
  ]
}
```

The module automatically:
1. Stores the preset data
2. Regenerates the preset button library
3. Updates all ShowCall preset buttons on connected Stream Decks

## Configuration

### Connection Settings

1. **Host**: ShowCall server address (default: `localhost`)
2. **Port**: ShowCall server port (default: `3200`)

### Module Setup

1. Install the ShowCall Companion module
2. Add a ShowCall connection in Companion
3. Configure host/port to match your ShowCall instance
4. Presets will sync automatically when connected

## Button Categories

The module creates buttons in several categories:

### ShowCall Presets (Dynamic)
- Automatically generated from ShowCall
- Updates when presets change
- Uses ShowCall colors and labels

### Basic Controls
- Cut to Program
- Clear All
- Tap Tempo
- Resync

### Layer Controls
- Layer 1-8 buttons with feedback
- Shows active/inactive state
- Displays layer status variables

### Column Controls
- Column 1-32 buttons
- Active column feedback
- Quick scene triggering

### Scene Macros (Static)
- Pre-configured macro buttons
- Walk-In, Sermon, Baptism, etc.
- Can be overridden by ShowCall presets

## Usage Examples

### Example 1: Using Auto-Generated Preset Buttons

1. In ShowCall, create a preset named "Worship Full"
2. Set ID to `worship_full`
3. Choose color `#e11d48` (red)
4. Save the preset
5. In Companion, go to Buttons
6. Find "ShowCall Presets" category
7. Drag "Worship Full" to your Stream Deck
8. Done! Button is ready to use

### Example 2: Custom Button with Preset Action

1. Create a new button in Companion
2. Add action: "ShowCall: Execute ShowCall Preset"
3. Enter preset ID: `worship_full`
4. Customize button appearance
5. Add feedbacks for connection status
6. Button will execute the preset when pressed

### Example 3: Conditional Preset Execution

Create a button that shows different states:

```javascript
// Button configuration
{
  "steps": [
    {
      "down": [
        {
          "actionId": "execute_preset",
          "options": {
            "preset_id": "worship_full"
          }
        }
      ]
    }
  ],
  "feedbacks": [
    {
      "feedbackId": "connection_status",
      "style": {
        "bgcolor": 0x00ff00,  // Green when connected
        "text": "READY"
      }
    },
    {
      "feedbackId": "any_clips_active",
      "style": {
        "text": "ACTIVE\\n$(showcall:program_clips)"
      }
    }
  ]
}
```

## Debugging

### Check Preset Sync

Monitor the Companion log for these messages:

```
✅ Presets updated from ShowCall: 5 presets
✅ Creating 5 dynamic preset buttons from ShowCall
✅ Added 5 ShowCall preset buttons
```

### Verify Preset Execution

When executing a preset, look for:

```
🎯 Executing ShowCall preset: worship_full
📤 Sending command to ShowCall: {"action":"execute_macro","macroId":"worship_full"}
```

### Troubleshooting Connection

If presets aren't syncing:

1. Check WebSocket connection status
2. Verify ShowCall is running
3. Check host/port configuration
4. Look for WebSocket errors in logs
5. Reconnect the module

Common log messages:

```
✅ Connected to ShowCall
❌ Cannot send command - not connected to ShowCall
🔄 Reconnecting to ShowCall (attempt 1/10)
```

## Technical Details

### Preset Storage

Presets are stored in the module's `showcallPresets` array:

```javascript
this.showcallPresets = [
  {
    id: "worship_full",
    label: "Worship Full",
    color: "#e11d48",
    hotkey: "w",
    macro: [...]
  }
]
```

### Color Processing

The module automatically:
- Converts hex color strings to RGB numbers
- Calculates optimal text color (black/white) based on background brightness
- Applies darker colors when disconnected

```javascript
// Example color processing
const bgColor = parseInt(preset.color.replace('#', ''), 16)
const brightness = (r * 299 + g * 587 + b * 114) / 1000
const textColor = brightness > 128 ? 0x000000 : 0xffffff
```

### Preset Button Generation

When presets update, the module calls `initPresets()` which:
1. Clears existing preset definitions
2. Creates static control buttons
3. Iterates through `showcallPresets` array
4. Generates a button for each preset
5. Applies colors and feedbacks
6. Updates Companion's preset library

## API Integration

### Receiving Preset Updates

```javascript
// In handleMessage function
else if (message.type === 'presets_updated') {
  this.log('info', `Presets updated: ${message.data.length} presets`)
  this.showcallPresets = message.data || []
  this.initPresets() // Regenerate all presets
}
```

### Sending Preset Execution

```javascript
// Execute preset action callback
callback: async (action) => {
  const presetId = action.options.preset_id
  this.log('info', `Executing ShowCall preset: ${presetId}`)
  this.sendCommand('execute_macro', {
    macroId: presetId
  })
}
```

### WebSocket Message Format

**Preset Update** (ShowCall → Companion):
```json
{
  "type": "presets_updated",
  "data": [
    {
      "id": "preset_id",
      "label": "Preset Name",
      "color": "#HEX",
      "hotkey": "key",
      "macro": [...]
    }
  ]
}
```

**Preset Execution** (Companion → ShowCall):
```json
{
  "action": "execute_macro",
  "macroId": "preset_id"
}
```

## Development

### Testing Preset Sync

1. Start ShowCall with logging enabled
2. Connect Companion module
3. Create a new preset in ShowCall
4. Watch Companion logs for preset sync
5. Verify button appears in "ShowCall Presets"

### Adding Custom Processing

You can customize preset processing by modifying the preset generation loop:

```javascript
this.showcallPresets.forEach((preset, index) => {
  // Custom processing here
  
  // Example: Add prefix to all preset labels
  const label = `[LIVE] ${preset.label}`
  
  // Example: Override colors based on preset ID
  let bgColor = preset.id.startsWith('worship') ? 0xff0000 : 0x0000ff
  
  // Generate button with custom processing
  presets.push({
    type: 'button',
    category: 'ShowCall Presets',
    name: label,
    style: {
      text: label,
      bgcolor: bgColor
    },
    // ... rest of configuration
  })
})
```

## Version History

### v2.1.0
- ✨ Added automatic preset synchronization
- 🎯 New "Execute ShowCall Preset" action
- 🔄 Dynamic preset button generation
- 📡 Real-time preset updates via WebSocket
- 🎨 Automatic color and text optimization

### v2.0.2
- 🐛 Bug fixes and stability improvements
- 📊 Enhanced feedback system
- 🔧 Improved connection handling

## Support

For issues or feature requests:
- GitHub: https://github.com/trevormarrr/showcall
- Check ShowCall main documentation
- Review Companion logs for errors

## License

Same license as ShowCall main project.
