# Quick Start: Dynamic Button Names

## What's New? 🎉

Your ShowCall Companion module now has **automatic dynamic button names** that update in real-time from ShowCall!

## How to Use Right Now

### 1. Install the Updated Module
- Replace `main.js` with the enhanced version
- No additional setup required
- All existing buttons still work

### 2. The Magic Variable Syntax
Button text now uses this format:
```
$(showcall:VARIABLE_NAME)
```

### 3. Most Useful Variables

| What You Want | Variable Name |
|---------------|---------------|
| A clip name | `$(showcall:clip_1_1_name)` |
| A layer name | `$(showcall:layer_1_name)` |
| Layer status | `$(showcall:layer_1_status)` |
| A column name | `$(showcall:column_1_name)` |
| Connection status | `$(showcall:connection_status)` |
| Current BPM | `$(showcall:bpm)` |
| Active clips count | `$(showcall:program_clips)` |

## See It in Action

### Example 1: Clip Name Button
```javascript
Button Text: $(showcall:clip_1_1_name)
```
**What Happens:** Instead of showing "L1C1", it shows whatever clip is actually in that slot, like "Intro Video"

### Example 2: Layer Information
```javascript
Button Text: $(showcall:layer_1_name)
              $(showcall:layer_1_status)
```
**What Happens:** Shows something like:
```
Video Layer
Active (2)
```

### Example 3: System Overview
```javascript
Button Text: $(showcall:connection_status)
             $(showcall:program_clips) clips
             $(showcall:bpm) BPM
```
**What Happens:** Shows real-time info like:
```
Connected
3 clips
120 BPM
```

## Pre-built Buttons Ready to Use

The module comes with these buttons already configured with dynamic names:

✅ **Clip Trigger Buttons** (Layer 1-4, Column 1-8)
- Shows clip names from ShowCall
- Red highlight when clip is active

✅ **Layer Status Buttons** (Layer 1-8)
- Shows layer name + status
- Orange highlight when layer has clips

✅ **Column Buttons** (Column 1-8)
- Shows column names
- Blue highlight when active

✅ **System Status Button**
- Shows connection, clip count, BPM
- Green highlight when connected

## How It Updates

**Automatic!** When you:
1. Change a clip name in ShowCall
2. Rename a layer in ShowCall
3. Modify any metadata in ShowCall

Your **buttons instantly reflect the changes** - no manual updates needed!

## Troubleshooting

**"Why is my button still showing 'Layer 1'?"**
- ShowCall might not be connected
- Check System Status button (should be green)
- Variable might not have received data yet

**"Button text won't update"**
- Check variable name spelling (case-sensitive!)
- Verify ShowCall is connected
- Give it a few seconds for data to arrive

**"I see (Unknown) or blank values"**
- Normal on first connection
- Data updates within 1 second
- Check connection_status variable

## Creating Custom Buttons

Want to make your own dynamic button? Easy!

### Steps:
1. Create a new button in Stream Deck
2. Set the button text to use a variable:
   ```
   $(showcall:VARIABLE_NAME)
   ```
3. Set your desired size/color
4. Add actions/feedbacks as needed
5. **Done!** Text updates automatically

### Button Text Examples:

**Simple Clip Button:**
```
$(showcall:clip_1_1_name)
```

**Multi-line with Status:**
```
$(showcall:layer_1_name)
$(showcall:layer_1_status)
```

**Include Dynamic Values:**
```
Now Playing:
$(showcall:current_program_clip)
```

**System Information:**
```
$(showcall:connection_status)
BPM: $(showcall:bpm)
```

## All Available Variables

### Clips (Layer × Column)
- `clip_1_1_name`, `clip_1_2_name`, ... `clip_2_8_name`
- Shows the actual clip name in that slot

### Layers
- `layer_1_name` through `layer_8_name` - Layer names
- `layer_1_status` through `layer_8_status` - Active/Inactive

### Columns
- `column_1_name` through `column_8_name` - Column names

### System
- `connection_status` - "Connected" or "Disconnected"
- `showcall_host` - IP/hostname
- `bpm` - Current BPM (120, etc)
- `program_clips` - Number of clips playing
- `composition_size` - Like "8x32"
- `composition_name` - Name of composition
- `program_clip_names` - All clip names
- `active_layers` - Count of active layers
- `active_columns` - Count of active columns

**Full reference:** See `VARIABLES_REFERENCE.md`

## Keyboard Shortcut Reference

In Stream Deck, when editing button text:
- Use `$(showcall:` and start typing variable name for autocomplete
- Variable names are case-sensitive
- Use `\n` for line breaks

## Examples of Real-World Buttons

### Church Service Setup
```
Button 1 - Pre-Service
$(showcall:clip_1_1_name)

Button 2 - Main Sermon
$(showcall:layer_2_name)
$(showcall:layer_2_status)

Button 3 - Status
$(showcall:connection_status)
$(showcall:program_clips) clips
```

### Live Event Setup
```
Button: Scene Overview
$(showcall:layer_1_name) / $(showcall:layer_2_name)
$(showcall:program_clips) active
```

### DJ/VJ Setup
```
Button: Current Tempo
BPM: $(showcall:bpm)
```

## Performance Notes

- ✅ **Updates:** Real-time, no lag
- ✅ **Variables:** 60+ available, easily extendable
- ✅ **Compatibility:** Works with all Companion versions
- ✅ **Fallback:** Shows sensible defaults if data missing

## Next Steps

1. **Update your buttons** to use dynamic variables
2. **Create custom buttons** with your own variable combinations
3. **Read the guides** for advanced usage (see files below)

## Need More Details?

- 📖 **User Guide:** `DYNAMIC_BUTTONS_GUIDE.md` - Complete documentation
- 📋 **Variables List:** `VARIABLES_REFERENCE.md` - All variables explained
- 🗺️ **Roadmap:** `INTEGRATION_ROADMAP.md` - Future improvements planned
- 📊 **Summary:** `ENHANCEMENT_SUMMARY.md` - Technical overview

## Questions?

Check these in order:
1. System Status button (verify connection)
2. VARIABLES_REFERENCE.md (verify variable names)
3. DYNAMIC_BUTTONS_GUIDE.md (troubleshooting section)

## Summary

- 🎯 **Goal:** Professional buttons that match your ShowCall setup
- ✨ **Magic:** Automatic updates from ShowCall
- 📱 **Implementation:** Easy variable syntax: `$(showcall:name)`
- 🚀 **Result:** Beautiful, responsive live control interface

**Enjoy your improved ShowCall integration!** 🎉

---

**Version:** 2.1.1+  
**Last Updated:** April 21, 2026
