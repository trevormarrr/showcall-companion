# ShowCall Companion Module v2.1.0 - Installation Package

## 📦 What's Included

This package (`companion-module-showcall-2.1.0.tgz`) contains:

- ✅ **Core module files** (index.js, main.js, upgrades.js)
- ✅ **Companion manifest** (companion/manifest.json)
- ✅ **Complete documentation** (README, CHANGELOG, guides)
- ✅ **Installation scripts** (install.sh, install.bat)
- ✅ **License and metadata**

**Package Size:** 33.5 KB (clean, production-ready)  
**Version:** 2.1.0  
**Release Date:** February 14, 2026

---

## 🚀 Quick Install (Recommended)

### Method 1: Via Companion UI (Easiest)

1. **Open Bitfocus Companion** (version 3.0+)
2. Navigate to **Modules** tab
3. Click **"+ Add Connection"**
4. Search for **"ShowCall"** or browse to **Video** category
5. If v2.1.0 isn't available yet, use Method 2 below

### Method 2: Manual Installation

1. **Download** `companion-module-showcall-2.1.0.tgz`

2. **Stop Companion** if running

3. **Extract to Companion's module directory:**

   **macOS/Linux:**
   ```bash
   # Find your Companion directory
   cd ~/companion-satellite  # or wherever Companion is installed
   
   # Extract module
   tar -xzf /path/to/companion-module-showcall-2.1.0.tgz -C ./bundled-modules/
   
   # Rename to proper format
   mv ./bundled-modules/package ./bundled-modules/companion-module-showcall
   ```

   **Windows:**
   ```cmd
   # Extract using 7-Zip or similar
   # Place in: C:\Users\<YourName>\companion-satellite\bundled-modules\companion-module-showcall
   ```

4. **Start Companion**

5. **Add ShowCall Connection:**
   - Go to Connections tab
   - Click "+ Add Connection"
   - Select "ShowCall"
   - Enter your ShowCall server IP (default: localhost)
   - Port: 3200
   - Save

---

## 🔧 Alternative: Quick Install Script

You can also use the included installation script:

**macOS/Linux:**
```bash
tar -xzf companion-module-showcall-2.1.0.tgz
cd package
chmod +x install.sh
./install.sh
```

**Windows:**
```cmd
# Extract companion-module-showcall-2.1.0.tgz
cd package
install.bat
```

---

## ✅ Verify Installation

After installing, verify the module is working:

1. **Check Connection Status:**
   - Companion Connections tab should show "ShowCall" as **Connected** (green)
   - If red, check that ShowCall app is running on port 3200

2. **Test Preset Sync:**
   - Create a preset in ShowCall app
   - Open Companion Buttons page
   - You should see a new button appear automatically under "ShowCall Presets"

3. **Test Button Actions:**
   - Add a button
   - Choose action: "ShowCall: Execute Preset"
   - Select a preset from the dropdown
   - Press the button on your Stream Deck
   - Preset should execute in Resolume

---

## 📋 What's New in v2.1.0

### ✨ Major Features

- 🎛️ **Automatic Preset Synchronization**
  - Presets auto-sync from ShowCall to Stream Deck
  - Real-time updates when presets are created/modified
  - Zero manual configuration required

- 🎨 **Dynamic Button Generation**
  - Buttons auto-created for each preset
  - Smart color optimization from preset colors
  - Automatic layout in "ShowCall Presets" section

- ⚡ **Execute Preset Action**
  - New action: "Execute Preset"
  - Dropdown selector for all available presets
  - Instant execution via WebSocket communication

- 📡 **Enhanced WebSocket Communication**
  - Persistent connection to ShowCall server
  - Auto-reconnect on disconnect (5-second retry)
  - Real-time preset updates (<100ms latency)

### 🔧 Technical Improvements

- Enhanced error handling and logging
- Improved connection stability
- Better preset storage and retrieval
- Optimized button styling algorithm

---

## 🔗 Requirements

- **Bitfocus Companion:** v3.0 or higher
- **ShowCall:** v2.3.0 or higher (for preset sync features)
- **Node.js:** 18+ (bundled with Companion)
- **Network:** ShowCall and Companion on same network (or localhost)

---

## 📚 Documentation

Included in this package:

- **README.md** - Main documentation
- **CHANGELOG.md** - Version history
- **INSTALLATION_GUIDE.md** - Detailed installation steps
- **PRESET_INTEGRATION.md** - Technical integration guide
- **DIAGNOSTIC_GUIDE.md** - Troubleshooting help
- **UPGRADE_SUMMARY.md** - Upgrade instructions from v2.0

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** "ShowCall" shows as disconnected (red)

**Solutions:**
1. Verify ShowCall app is running
2. Check ShowCall is on port 3200 (default)
3. Check firewall isn't blocking port 3200
4. Try reconnecting in Companion

### Presets Not Syncing

**Problem:** Presets don't appear automatically

**Solutions:**
1. Check ShowCall version is 2.3.0+
2. Verify WebSocket connection in Companion logs
3. Try manually reconnecting in Companion
4. Create a test preset to trigger sync

### Buttons Not Working

**Problem:** Clicking Stream Deck button does nothing

**Solutions:**
1. Check preset name matches exactly
2. Verify ShowCall is connected to Resolume
3. Check Companion logs for errors
4. Try removing and re-adding the button

---

## 📞 Support

- **GitHub Issues:** https://github.com/trevormarr/showcall-companion/issues
- **Documentation:** See included guides in package
- **ShowCall Repo:** https://github.com/trevormarr/showcall

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Installation Complete!

Once installed, you should see:
- ✅ ShowCall connection available in Companion
- ✅ Presets auto-syncing from ShowCall
- ✅ Dynamic buttons on your Stream Deck
- ✅ "Execute Preset" action available

**Next Steps:**
1. Create some presets in ShowCall
2. Watch them appear on your Stream Deck
3. Start controlling Resolume with ease!

---

**Package:** `companion-module-showcall-2.1.0.tgz`  
**Version:** 2.1.0  
**Date:** February 14, 2026  
**Status:** ✅ Production Ready
