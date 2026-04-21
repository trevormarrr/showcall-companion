# Dynamic Button Names and Variables Guide

## Overview

This enhanced version of the ShowCall Companion module now supports **dynamic button naming** through a powerful variable system. This allows button labels to automatically update in real-time as data changes in ShowCall, eliminating the need for static button text.

## Key Features

### 1. **Dynamic Clip Names**
Buttons now automatically display clip names from ShowCall instead of static "L1C1" labels.

```
Button Text Variable: $(showcall:clip_LAYER_COLUMN_name)
Example: $(showcall:clip_1_1_name)
```

**How it works:**
- When ShowCall sends clip data, the module extracts clip names
- These names are stored in variables like `clip_1_1_name`, `clip_1_2_name`, etc.
- Buttons using these variables automatically update when clip names change in ShowCall

### 2. **Dynamic Layer Names**
Each layer can have a custom name that updates on button displays.

```
Button Text Variable: $(showcall:layer_LAYER_name)
Example: $(showcall:layer_1_name)
```

**Available Variables:**
- `layer_1_name` through `layer_8_name` - Display custom layer names
- `layer_1_status` through `layer_8_status` - Show active status with clip count

### 3. **Dynamic Column Names**
Columns now support custom naming.

```
Button Text Variable: $(showcall:column_COLUMN_name)
Example: $(showcall:column_1_name)
```

## New Variables Added

### Clip Name Variables
- `clip_1_1_name` - Layer 1, Column 1 clip name
- `clip_1_2_name` - Layer 1, Column 2 clip name
- `clip_1_3_name` - Layer 1, Column 3 clip name
- `clip_1_4_name` - Layer 1, Column 4 clip name
- `clip_1_5_name` - Layer 1, Column 5 clip name
- `clip_1_6_name` - Layer 1, Column 6 clip name
- `clip_1_7_name` - Layer 1, Column 7 clip name
- `clip_1_8_name` - Layer 1, Column 8 clip name
- `clip_2_1_name` through `clip_2_8_name` - Layer 2 clips

### Layer Name Variables
- `layer_1_name` through `layer_8_name` - Custom layer names

### Column Name Variables
- `column_1_name` through `column_8_name` - Custom column names

### System Status Variables
- `last_executed_preset` - Name of the most recently executed preset
- `available_presets_count` - Total number of available presets
- `bpm` - Current BPM value
- `program_clips` - Number of active clips
- `composition_size` - Composition dimensions (e.g., "8x32")

## How Button Updates Work

### Update Flow
1. **ShowCall sends status update** with clip/layer/column metadata
2. **Companion module processes** the data and extracts names
3. **Variables are updated** with new names/values
4. **Stream Deck receives** the variable update
5. **Button text refreshes** automatically in real-time

### Variable Substitution in Buttons

Companion uses the `$(showcall:VARIABLE_NAME)` syntax to substitute variables in button text:

```javascript
// Example button configurations

// Button showing clip name
{
    style: {
        text: `$(showcall:clip_1_1_name)`
    }
}

// Button showing layer name and status
{
    style: {
        text: `$(showcall:layer_1_name)\n$(showcall:layer_1_status)`
    }
}

// Multi-line with dynamic values
{
    style: {
        text: `$(showcall:column_1_name)\n$(showcall:program_clips) clips\n$(showcall:bpm) BPM`
    }
}
```

## Pre-configured Dynamic Buttons

### Clip Trigger Buttons (Layer 1-4, Column 1-8)
- **Category:** Layer [1-4]
- **Display:** Uses `$(showcall:clip_LAYER_COLUMN_name)` to show actual clip names
- **Feedback:** Red highlight when clip is active
- **Action:** Triggers the specific clip in ShowCall

### Layer Status Buttons (Layer 1-8)
- **Category:** Layer Status
- **Display:** Shows layer name + status (e.g., "Video\nActive (2)")
- **Uses:** `$(showcall:layer_LAYER_name)` and `$(showcall:layer_LAYER_status)`
- **Feedback:** Orange highlight when layer has active clips
- **Action:** Stops the entire layer

### Column Trigger Buttons (Column 1-8)
- **Category:** Columns
- **Display:** Uses `$(showcall:column_COLUMN_name)`
- **Feedback:** Blue highlight when column has active clips
- **Action:** Triggers all clips in the column

### System Status Button
- **Category:** System
- **Display:** `Connected\n[X] clips\n[BPM] BPM`
- **Uses:** Combines multiple variables for overview
- **Feedback:** Green when connected, yellow text when clips active

## Integration with ShowCall

### What ShowCall Should Send

For the system to work optimally, ShowCall should send:

```json
{
  "type": "status_update",
  "data": {
    "connected": true,
    "bpm": 120,
    "comp": "MyComposition",
    "programClips": [
      {
        "layer": 1,
        "column": 1,
        "clipName": "Intro Video",
        "layerName": "Video Layer",
        "opacity": 1.0,
        "volume": 1.0,
        "position": 0,
        "duration": 30000
      }
    ]
  }
}
```

### Data Extraction

The module extracts and stores:
- **Clip names** → `clip_LAYER_COLUMN_name` variables
- **Layer information** → `layer_LAYER_name` and `layer_LAYER_status` variables
- **BPM** → `bpm` variable
- **Connection status** → `connection_status` variable

## Advanced Usage

### Creating Custom Buttons with Dynamic Names

You can create your own buttons using the dynamic variables:

```javascript
// Example: Custom clip button with dynamic name
{
    type: 'button',
    category: 'My Clips',
    name: 'Scene 1',
    style: {
        // Button text updates automatically from ShowCall
        text: `$(showcall:clip_1_1_name)\nActive`,
        size: '14',
        color: 0xffffff,
        bgcolor: 0x202020
    },
    steps: [{
        down: [{
            actionId: 'trigger_clip',
            options: { layer: 1, column: 1 }
        }]
    }],
    feedbacks: [{
        feedbackId: 'clip_active',
        options: { layer: 1, column: 1 },
        style: { bgcolor: 0xff0000 }
    }]
}
```

### Combining Multiple Variables

```javascript
// Show layer name, clip count, and BPM
{
    style: {
        text: `$(showcall:layer_1_name)\n$(showcall:program_clips) clips\n$(showcall:bpm) BPM`
    }
}
```

## Troubleshooting

### Buttons Not Updating
1. Check that ShowCall is connected (System Status button should be green)
2. Verify ShowCall is sending clip data
3. Check module logs for connection errors

### Variables Show as "(Unknown)"
1. ShowCall may not have sent the data yet
2. Check ShowCall's output format matches expected structure
3. Verify the variable name is spelled correctly

### Fallback Values
If ShowCall doesn't provide certain data, the system uses fallbacks:
- Layer names default to "Layer 1", "Layer 2", etc.
- Column names default to "Column 1", "Column 2", etc.
- Clip names default to "Clip L1C1", "Clip L1C2", etc.

## Performance Considerations

- **Variable updates** are efficient and only occur when data changes
- **Button rendering** is handled by Stream Deck hardware
- **Network traffic** is minimal - only metadata is transmitted

## Future Enhancements

Potential improvements for future versions:
- Extended clip name variables for all layers/columns
- Custom layer/column name configuration UI
- Preset name variables
- Real-time thumbnail/icon updates based on clip content
- Custom color variables based on ShowCall settings

## File Changes Summary

### Updated `main.js`

**New Variable Definitions:**
- Added 60+ new dynamic variables for clip, layer, and column names
- Added preset tracking variables
- Extended composition metadata variables

**Updated Functions:**
- `initVariables()` - Extended with dynamic name variables
- `updateVariables()` - Now populates clip names from ShowCall data
- `initPresets()` - Updated preset buttons to use variable substitution

**Benefits:**
- Automatic button updates when clip names change
- Real-time layer and column status
- Better integration with ShowCall's metadata
- More professional and dynamic UI

## Example Workflow

1. **Setup:** Install companion module with this version
2. **Create buttons:** Use pre-made or custom buttons with variable text
3. **Connect:** Connect to ShowCall instance
4. **Configure:** Set layer/column/clip names in ShowCall
5. **Enjoy:** Button text updates automatically in real-time!

---

**Version:** 2.1.1+  
**Last Updated:** 2026-04-21  
**Module:** companion-module-showcall
