# ShowCall Companion - Variable Implementation Reference

## Quick Reference Guide

### Variable Name Format
```
$(showcall:VARIABLE_NAME)
```

## Available Variables by Category

### Connection Status
| Variable | Type | Example Value |
|----------|------|---------------|
| `connection_status` | String | "Connected" / "Disconnected" |
| `showcall_host` | String | "localhost" |
| `showcall_timestamp` | String | "14:32:15" |
| `connection_uptime` | String | "1h 23m" |

### Composition Information
| Variable | Type | Example Value |
|----------|------|---------------|
| `composition_name` | String | "Sunday Service" |
| `composition_size` | String | "8x32" |
| `program_clips` | Number | 3 |
| `available_presets_count` | Number | 8 |

### BPM & Tempo
| Variable | Type | Range |
|----------|------|-------|
| `bpm` | Number | 60-200 |

### Layer Information
| Variable Pattern | Type | Example |
|------------------|------|---------|
| `layer_N_status` | String | "Active (2)" / "Inactive" |
| `layer_N_name` | String | "Video Layer" |

Where N = 1-8

### Column Information
| Variable Pattern | Type | Example |
|------------------|------|---------|
| `column_N_name` | String | "Intro" |

Where N = 1-8

### Clip Information
| Variable Pattern | Type | Example |
|------------------|------|---------|
| `clip_L_C_name` | String | "Intro Video" |

Where L = Layer (1-8), C = Column (1-32)

### Program Status
| Variable | Type | Example |
|----------|------|---------|
| `program_clip_names` | String | "L1C1:Video, L2C3:Graphics" |
| `current_program_clip` | String | "L1C1: Intro" |
| `current_preview_clip` | String | "None" |
| `last_triggered_clip` | String | "L1C1" |
| `last_executed_preset` | String | "Service Preset" |

## Usage Examples

### Example 1: Dynamic Clip Button
```javascript
{
    style: {
        text: `$(showcall:clip_1_1_name)`,
        size: '14',
        color: 0xffffff,
        bgcolor: 0x202020
    }
}
```
**Result:** Button displays the actual clip name from ShowCall

### Example 2: Layer Status Indicator
```javascript
{
    style: {
        text: `$(showcall:layer_1_name)\n$(showcall:layer_1_status)`,
        size: '12',
        color: 0xffffff,
        bgcolor: 0x2c2c2c
    }
}
```
**Result:** Shows "Video Layer\nActive (2)"

### Example 3: System Overview
```javascript
{
    style: {
        text: `$(showcall:connection_status)\n$(showcall:program_clips) clips\n$(showcall:bpm) BPM`,
        size: '10',
        color: 0xffffff,
        bgcolor: 0x2c2c2c
    }
}
```
**Result:** Shows "Connected\n3 clips\n120 BPM"

### Example 4: Column with Clips
```javascript
{
    style: {
        text: `$(showcall:column_1_name)`,
        size: '14',
        color: 0xffffff,
        bgcolor: 0x2c3e50
    }
}
```
**Result:** Shows column name like "Intro"

### Example 5: Multi-Line Information
```javascript
{
    style: {
        text: `$(showcall:layer_1_name)\n$(showcall:clip_1_1_name)\n$(showcall:layer_1_status)`,
        size: '11',
        color: 0xffffff,
        bgcolor: 0x202020
    }
}
```
**Result:** Shows comprehensive layer information

## Variable Substitution Rules

### Basic Substitution
```
Text: "Playing: $(showcall:current_program_clip)"
Result: "Playing: L1C1: Intro Video"
```

### Multiline with Variables
Use `\n` for line breaks:
```javascript
text: `Layer: $(showcall:layer_1_name)\nStatus: $(showcall:layer_1_status)`
```

### Fallback Values
If ShowCall hasn't sent data yet, variables show:
- Names: "Layer 1", "Column 1", "Clip L1C1"
- Status: "Inactive"
- Connection: "Disconnected"
- BPM: "120"

### Safe Usage
```javascript
// Always safe to use - has fallback values
text: `$(showcall:bpm)`,

// Safe - has predefined values
text: `$(showcall:connection_status)`,

// Safe - has dynamic fallback
text: `$(showcall:layer_1_name)`
```

## Creating Custom Button Templates

### Template: Simple Clip Button
```javascript
createClipButton(layer, column) {
    return {
        type: 'button',
        category: `Layer ${layer}`,
        name: `Clip L${layer}C${column}`,
        style: {
            text: `$(showcall:clip_${layer}_${column}_name)`,
            size: '14',
            color: 0xffffff,
            bgcolor: 0x202020
        },
        steps: [{
            down: [{
                actionId: 'trigger_clip',
                options: { layer, column }
            }]
        }],
        feedbacks: [{
            feedbackId: 'clip_active',
            options: { layer, column },
            style: { bgcolor: 0xff0000 }
        }]
    }
}
```

### Template: Layer Control
```javascript
createLayerButton(layer) {
    return {
        type: 'button',
        category: 'Layers',
        name: `Layer ${layer}`,
        style: {
            text: `$(showcall:layer_${layer}_name)\n$(showcall:layer_${layer}_status)`,
            size: '12',
            color: 0xffffff,
            bgcolor: 0x2c2c2c
        },
        steps: [{
            down: [{
                actionId: 'stop_layer',
                options: { layer }
            }]
        }],
        feedbacks: [{
            feedbackId: 'layer_active',
            options: { layer },
            style: { bgcolor: 0xffaa00 }
        }]
    }
}
```

### Template: Status Display
```javascript
createStatusButton() {
    return {
        type: 'button',
        category: 'System',
        name: 'Status',
        style: {
            text: `$(showcall:connection_status)\n$(showcall:program_clips) clips\n$(showcall:bpm) BPM`,
            size: '10',
            color: 0xffffff,
            bgcolor: 0x2c2c2c
        },
        steps: [{ down: [], up: [] }],
        feedbacks: [{
            feedbackId: 'connection_status',
            options: {},
            style: { bgcolor: 0x008000 }
        }]
    }
}
```

## Performance Tips

### 1. Update Frequency
Variables update as data arrives from ShowCall. Typical update rate: 100-500ms

### 2. Efficient Variable Naming
```javascript
// ✅ Good - specific variable names
`$(showcall:clip_1_1_name)`

// ❌ Avoid - complex expressions
`$(showcall:program_clip_names)` // Contains all clips
```

### 3. Combine Related Variables
```javascript
// ✅ Efficient - uses 2 related variables
`$(showcall:layer_1_name)\n$(showcall:layer_1_status)`

// ❌ Inefficient - duplicates info
`Layer 1\n$(showcall:layer_1_name)\n$(showcall:layer_1_status)`
```

## Debugging Variables

### Check Variable Values
In Stream Deck companion, you can:
1. Go to the Instance Settings
2. Look at Variable Definitions
3. See current values under "Variable Values"

### Common Issues

| Issue | Solution |
|-------|----------|
| Variable shows empty | Connection may be down - check `connection_status` |
| Variable shows "Inactive" | No data received yet for that layer/column |
| Variable shows "Layer 1" | ShowCall hasn't sent custom name yet |
| Button text not updating | Verify variable name spelling in button config |

## Integration Notes

### Data Flow
```
ShowCall
    ↓ (sends clip/layer data)
Companion Module
    ↓ (extracts and stores in variables)
Variable System
    ↓ (substitutes into button text)
Stream Deck
    ↓ (displays updated button)
```

### Update Cycle
1. **Message received** from ShowCall (100-500ms interval)
2. **Variables updated** immediately
3. **Button text rendered** by Stream Deck
4. **User sees** updated text

### Variable Limitations
- Maximum 1000 character display in buttons
- Variable names are case-sensitive
- Substitution happens per button, not globally
- Each button can use multiple variables

## Future Variable Additions

Planned variables for future releases:
- `clip_L_C_progress` - Clip playback progress percentage
- `clip_L_C_duration` - Total duration in seconds
- `layer_N_volume` - Layer volume level
- `layer_N_opacity` - Layer opacity percentage
- `preset_N_name` - Individual preset names

---

**Last Updated:** 2026-04-21  
**Version:** 2.1.1+
