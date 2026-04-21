# ShowCall Companion Module - Enhanced Integration Roadmap

## Overview

This document outlines improvements to make the companion app's button system and ShowCall integration significantly better. These are implementation guidelines for advanced features.

## 1. Enhanced Variable System

### Current Implementation
- ✅ Dynamic clip names from ShowCall
- ✅ Layer status tracking
- ✅ Column name variables
- ✅ Real-time variable updates

### Recommended Next Steps

#### 1.1 Extend Clip Name Coverage
Currently limited to Layer 1-2, Column 1-8. Expand to full grid:

```javascript
// In updateVariables()
for (let layer = 1; layer <= 8; layer++) {
    for (let column = 1; column <= 32; column++) {
        clipVariables[`clip_${layer}_${column}_name`] = 
            program.find(p => p.layer === layer && p.column === column)?.clipName || 
            `L${layer}C${column}`
    }
}
```

#### 1.2 Add Layer Metadata
Extract more info from ShowCall:

```javascript
// New variables to add to initVariables()
{ variableId: 'layer_1_color', name: 'Layer 1 Color' },
{ variableId: 'layer_1_volume', name: 'Layer 1 Volume' },
{ variableId: 'layer_1_opacity', name: 'Layer 1 Opacity' },
{ variableId: 'layer_1_mode', name: 'Layer 1 Blend Mode' }
```

#### 1.3 Composition Metadata
Store and expose composition structure:

```javascript
{ variableId: 'composition_layers_count', name: 'Total Layers' },
{ variableId: 'composition_columns_count', name: 'Total Columns' },
{ variableId: 'composition_total_clips', name: 'Total Clips Available' }
```

## 2. Advanced Preset System

### Current Implementation
- ✅ Dynamic preset buttons from ShowCall
- ✅ Preset active feedback
- ✅ Preset execution action

### Recommended Enhancements

#### 2.1 Preset Metadata Variables
```javascript
// Add to initVariables()
{ variableId: 'preset_1_name', name: 'Preset 1 Name' },
{ variableId: 'preset_1_description', name: 'Preset 1 Description' },
{ variableId: 'preset_execution_time', name: 'Last Preset Execution Time' }
```

#### 2.2 Preset Chain Support
Allow executing multiple presets in sequence:

```javascript
// New action
execute_preset_sequence: {
    name: 'Execute Preset Sequence',
    options: [
        {
            type: 'textinput',
            label: 'Preset IDs (comma-separated)',
            id: 'preset_ids'
        },
        {
            type: 'number',
            label: 'Delay Between Presets (ms)',
            id: 'delay',
            default: 500
        }
    ],
    callback: async (action) => {
        const ids = action.options.preset_ids.split(',').map(s => s.trim())
        for (const id of ids) {
            this.sendCommand('execute_macro', { macroId: id })
            await new Promise(resolve => setTimeout(resolve, action.options.delay))
        }
    }
}
```

#### 2.3 Preset Groups
Organize presets by category with dedicated buttons:

```javascript
// In initPresets()
const groupedPresets = this.showcallPresets.reduce((acc, preset) => {
    const group = preset.group || 'Ungrouped'
    if (!acc[group]) acc[group] = []
    acc[group].push(preset)
    return acc
}, {})
```

## 3. Real-Time Clip Information

### Current Implementation
- ✅ Clip active/inactive state
- ✅ Clip opacity tracking
- ✅ Clip position in timeline

### Recommended Enhancements

#### 3.1 Clip Progress Variables
```javascript
// Add to clip data variables
{ variableId: 'clip_1_1_progress', name: 'Layer 1 Column 1 Progress %' },
{ variableId: 'clip_1_1_remaining', name: 'Layer 1 Column 1 Time Remaining' },
{ variableId: 'clip_1_1_duration_display', name: 'Layer 1 Column 1 Duration' }
```

#### 3.2 Visual Progress Feedback
```javascript
// New feedback type
clip_progress_bar: {
    name: 'Clip Progress Bar',
    type: 'advanced',
    callback: (feedback) => {
        const clip = getClipData(feedback.options)
        if (!clip) return {}
        
        const progress = (clip.position / clip.duration) * 100
        const displayText = `${Math.floor(progress)}%`
        
        return {
            text: displayText,
            bgcolor: (0xff0000 * progress/100) | (0x00ff00 * (1-progress/100))
        }
    }
}
```

#### 3.3 Clip Preview Thumbnails
```javascript
// When ShowCall provides thumbnail data
{ variableId: 'clip_1_1_thumbnail', name: 'Layer 1 Column 1 Thumbnail URL' }
```

## 4. Layer Control Enhancement

### Current Implementation
- ✅ Stop layer action
- ✅ Layer opacity control
- ✅ Layer status feedback

### Recommended Enhancements

#### 4.1 Extended Layer Actions
```javascript
// New actions to add
adjust_layer_volume: {
    name: 'Adjust Layer Volume',
    options: [
        { type: 'number', label: 'Layer', id: 'layer', min: 1, max: 8 },
        { type: 'number', label: 'Volume', id: 'volume', min: 0, max: 100 }
    ],
    callback: async (action) => {
        this.sendCommand('set_layer_volume', {
            layer: action.options.layer,
            volume: action.options.volume / 100
        })
    }
},

blend_layer_mode: {
    name: 'Set Layer Blend Mode',
    options: [
        { type: 'number', label: 'Layer', id: 'layer', min: 1, max: 8 },
        { type: 'dropdown', label: 'Mode', id: 'mode', 
          choices: [
            { id: 'normal', label: 'Normal' },
            { id: 'add', label: 'Add' },
            { id: 'multiply', label: 'Multiply' }
          ] 
        }
    ],
    callback: async (action) => {
        this.sendCommand('set_blend_mode', {
            layer: action.options.layer,
            mode: action.options.mode
        })
    }
}
```

#### 4.2 Layer Preset Buttons
```javascript
// Button for common layer configurations
{
    type: 'button',
    category: 'Layer Presets',
    name: 'Video Opacity 75%',
    steps: [{
        down: [{
            actionId: 'adjust_layer_opacity',
            options: { layer: 1, opacity: 75 }
        }]
    }]
}
```

## 5. Column Grid Control

### Current Implementation
- ✅ Trigger column action
- ✅ Column active feedback
- ✅ Dynamic column names

### Recommended Enhancements

#### 5.1 Column Range Actions
```javascript
// Control multiple columns at once
trigger_column_range: {
    name: 'Trigger Column Range',
    options: [
        { type: 'number', label: 'Start Column', id: 'start', min: 1, max: 32 },
        { type: 'number', label: 'End Column', id: 'end', min: 1, max: 32 }
    ],
    callback: async (action) => {
        for (let col = action.options.start; col <= action.options.end; col++) {
            this.sendCommand('trigger_column', { column: col })
        }
    }
},

stop_column_range: {
    name: 'Stop Column Range',
    options: [
        { type: 'number', label: 'Start Column', id: 'start', min: 1, max: 32 },
        { type: 'number', label: 'End Column', id: 'end', min: 1, max: 32 }
    ],
    callback: async (action) => {
        for (let col = action.options.start; col <= action.options.end; col++) {
            this.sendCommand('stop_column', { column: col })
        }
    }
}
```

#### 5.2 Column Status Indicators
```javascript
// Show all columns in one grid view
for (let col = 1; col <= 32; col++) {
    const preset = {
        type: 'button',
        category: 'Column Grid',
        name: `Col ${col}`,
        style: {
            text: `$(showcall:column_${col}_name)`,
            size: '10'
        }
    }
}
```

## 6. Performance & Stability

### Recommendations

#### 6.1 Debounce Variable Updates
```javascript
// Prevent excessive updates
constructor() {
    super(internal)
    this.updateDebounce = {}
}

updateVariables() {
    const now = Date.now()
    if (now - (this.updateDebounce.variables || 0) < 100) return
    this.updateDebounce.variables = now
    
    // ... existing update code ...
}
```

#### 6.2 Memory Management
```javascript
// Limit stored presets/clips
static MAX_PRESETS = 100
static MAX_CLIPS = 256

// Clean up old data periodically
setInterval(() => this.cleanupOldData(), 60000)

cleanupOldData() {
    if (this.showcallPresets.length > ShowCallInstance.MAX_PRESETS) {
        this.showcallPresets = this.showcallPresets.slice(-ShowCallInstance.MAX_PRESETS)
    }
}
```

## 7. ShowCall API Integration

### Improved Message Format

The module should handle enhanced ShowCall messages:

```javascript
{
    type: 'extended_status',
    data: {
        composition: {
            name: 'Service',
            layers: [
                {
                    id: 1,
                    name: 'Video',
                    type: 'video',
                    opacity: 1.0,
                    volume: 1.0,
                    blendMode: 'normal'
                }
            ],
            columns: [
                {
                    id: 1,
                    name: 'Intro',
                    clips: [
                        {
                            layer: 1,
                            name: 'Intro Video',
                            duration: 30000,
                            previewUrl: 'http://...'
                        }
                    ]
                }
            ]
        }
    }
}
```

## 8. User Configuration Options

### Config Fields to Add
```javascript
getConfigFields() {
    return [
        // Existing fields...
        {
            type: 'checkbox',
            label: 'Enable Dynamic Names',
            id: 'enable_dynamic_names',
            default: true
        },
        {
            type: 'number',
            label: 'Update Frequency (ms)',
            id: 'update_frequency',
            min: 100,
            max: 5000,
            default: 500
        },
        {
            type: 'checkbox',
            label: 'Auto-create Preset Buttons',
            id: 'auto_preset_buttons',
            default: true
        },
        {
            type: 'number',
            label: 'Max Presets to Display',
            id: 'max_presets',
            min: 5,
            max: 100,
            default: 20
        }
    ]
}
```

## Implementation Priority

### Phase 1 (Essential)
- ✅ Dynamic clip names (COMPLETED)
- ✅ Layer status variables (COMPLETED)
- ✅ Column name variables (COMPLETED)

### Phase 2 (High Priority)
- [ ] Extended clip coverage (all layers/columns)
- [ ] Layer metadata variables
- [ ] Preset chains
- [ ] Real-time progress indicators

### Phase 3 (Medium Priority)
- [ ] Column range actions
- [ ] Enhanced layer actions
- [ ] Performance optimization
- [ ] Memory management

### Phase 4 (Nice to Have)
- [ ] Thumbnail support
- [ ] Advanced color mapping
- [ ] Preset grouping UI
- [ ] Custom configuration panel

## Summary

The enhanced companion module now provides:
1. **Dynamic button text** that updates from ShowCall data
2. **Comprehensive variable system** for clip/layer/column information
3. **Real-time feedback** on composition status
4. **Better integration** with ShowCall's data format
5. **Foundation for advanced features** like presets, ranges, and metadata

The recommendations above provide a roadmap for continued improvement and more advanced integration features.

---

**Version:** 2.1.1+  
**Last Updated:** 2026-04-21  
