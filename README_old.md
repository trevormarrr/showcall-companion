# ShowCall Companion Module

Control ShowCall's Resolume integration directly from Stream Deck via Bitfocus Companion.

## 🎯 Latest Updates

### ✅ **Enhanced Feedbacks & Visual States**
- **Clip Active**: Red background when specific clips are active
- **Layer Status**: Yellow background when any clips are active in a layer  
- **Column Status**: Orange background when any clips are active in a column
- **Connection Status**: Green background when connected to ShowCall
- **Any Clips Active**: Purple background when any clips are running
- **BPM Range**: Green background when BPM is within specified range

### ✅ **Macro Support** 
- Execute ShowCall macros by ID (walkin, sermon, baptism, closing)
- Pre-built macro presets with color-coded buttons
- Full integration with ShowCall's preset system

### ✅ **Comprehensive Presets**
- Individual clip triggers (L1-L4, C1-C8) with active state feedback
- Column triggers (C1-C8) with activity feedback
- Layer status indicators (L1-L8) 
- Basic controls (Cut, Clear All) with connection status
- Scene macro buttons (Walk-In, Sermon, Baptism, Closing)

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

## Troubleshooting the "Cannot find module" Error

If you see: `Failed to get module api version: Error: Cannot find module '@companion-module/base/package.json'`

**Solution**: You need to run `npm install` in the module folder BEFORE adding it to Companion.

**Why**: The module depends on `@companion-module/base` which must be installed locally. Companion doesn't automatically install npm dependencies for developer modules.

**Steps**:
1. Download the module
2. Open terminal/command prompt in the module folder  
3. Run: `npm install`
4. Wait for completion
5. Then add to Companion as developer module
