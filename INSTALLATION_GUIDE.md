# ShowCall Companion Module v2.0 - Installation Guide

## 📦 **Ready-to-Install Packages**

Your ShowCall Companion module has been packaged and is ready for installation in Bitfocus Companion. Choose your preferred installation method:

### **Available Packages:**
- `companion-module-showcall-v2.0.0.tgz` - Compressed tar package (recommended)
- `companion-module-showcall-v2.0.0.zip` - Zip archive for Windows users
- `dist/` folder - Direct installation folder

## 🚀 **Installation Methods**

### **Method 1: Developer Module Installation (Recommended)**

1. **Open Bitfocus Companion**
2. **Go to Settings** → Click the cog/gear icon in the top right
3. **Set Developer Module Path**:
   - Find the "Developer modules path" field
   - Browse to the folder containing your ShowCall companion files
   - Select the `dist` folder from this project
4. **Restart Companion** - Companion will automatically restart
5. **Add ShowCall Connection**:
   - Go to the "Connections" tab
   - Click "Add Connection"
   - Search for "ShowCall" in the module list
   - Configure the connection (host: localhost, port: 3200)

### **Method 2: Manual Package Installation**

1. **Extract the Package**:
   ```bash
   # For .tgz file:
   tar -xzf companion-module-showcall-v2.0.0.tgz
   
   # For .zip file:
   unzip companion-module-showcall-v2.0.0.zip
   ```

2. **Copy to Companion Modules Directory**:
   - **Windows**: `%APPDATA%\Companion\modules\`
   - **macOS**: `~/Library/Application Support/Companion/modules/`
   - **Linux**: `~/.local/share/Companion/modules/`

3. **Create folder**: `companion-module-showcall/`
4. **Copy contents** of extracted package to this folder
5. **Restart Companion**

### **Method 3: Direct Folder Installation**

1. **Copy the `dist` folder** to your desired location
2. **Rename it** to `companion-module-showcall`
3. **Use Method 1** to point Companion to this folder

## ⚙️ **Configuration**

### **ShowCall Connection Settings**
- **Host**: `localhost` (if ShowCall is on same machine)
- **Port**: `3200` (default ShowCall companion port)

### **Testing the Installation**

1. **Check Connection Status**:
   - Connection should show "Connected" in green
   - Variables should populate with ShowCall data

2. **Test Basic Functionality**:
   - Use a preset button to trigger a clip
   - Button should change color when clip is active
   - Variables should update in real-time

3. **Verify Feedback System**:
   - Trigger clips in ShowCall directly
   - Stream Deck buttons should change colors automatically
   - Layer and column status should update

## 🎮 **Using the Presets**

### **Available Preset Categories**:
- **Basic Controls** - Cut, Clear All, Tap Tempo, Resync
- **Layer 1-4** - Individual clip controls (L1C1, L1C2, etc.)
- **Columns** - Column triggers (COL 1, COL 2, etc.)
- **Layer Status** - Layer monitoring with clip counts
- **Scene Macros** - Pre-configured scene buttons
- **BPM Control** - Tempo control presets
- **System** - Status monitoring

### **Using Presets**:
1. **Go to Buttons tab** in Companion
2. **Navigate to Presets** → **ShowCall**
3. **Drag presets** to your Stream Deck buttons
4. **Enjoy real-time feedback!**

## 🔧 **Troubleshooting**

### **Module Not Loading**
- ✅ Ensure `npm install` was run in the module directory
- ✅ Check that all files are present (main.js, package.json, companion/)
- ✅ Verify .companion-module file exists
- ✅ Restart Companion completely

### **Connection Issues**
- ✅ Verify ShowCall is running
- ✅ Check ShowCall companion port (usually 3200)
- ✅ Ensure firewall allows connection
- ✅ Try localhost vs 127.0.0.1

### **Feedback Not Working**
- ✅ Verify ShowCall is sending status updates
- ✅ Check Companion logs for WebSocket errors
- ✅ Test with simple presets first
- ✅ Ensure ShowCall companion API is enabled

### **Performance Issues**
- ✅ Start with fewer preset buttons
- ✅ Monitor system resources
- ✅ Check network connection stability
- ✅ Disable unnecessary feedback types

## 📋 **System Requirements**

### **ShowCall Companion Module v2.0**
- **Bitfocus Companion**: v3.0 or later
- **ShowCall**: v1.5.0 or later
- **Node.js**: v18.12 or later (handled by Companion)
- **Operating System**: Windows 10+, macOS 10.15+, Linux

### **Network Requirements**
- **Local Network**: ShowCall and Companion on same network
- **Port Access**: Port 3200 (ShowCall companion API)
- **WebSocket Support**: Required for real-time communication

## 🎯 **Features Included**

### **✅ Comprehensive Feedback System**
- Clip active indicators (red)
- Layer status indicators (orange)
- Column status indicators (blue)
- Connection status (green)
- BPM range indicators
- Opacity-based brightness
- Position-based color gradients

### **✅ Enhanced Controls**
- Individual clip triggers and stops
- Layer management with opacity
- Column operations
- Scene macro execution
- BPM control and tap tempo
- System monitoring

### **✅ Professional Presets**
- 100+ ready-to-use button configurations
- Multi-layered visual feedback
- Dynamic text with live variables
- Categorized for easy organization

## 📞 **Support**

If you encounter issues:

1. **Check the logs** in Companion for error messages
2. **Verify ShowCall API** is responding at `http://localhost:3200/api/companion`
3. **Test basic connectivity** using preset buttons
4. **Report issues** at: https://github.com/trevormarrr/showcall-companion/issues

---

**ShowCall Companion v2.0** - Professional Stream Deck control for ShowCall Resolume integration.

*Installation complete! Enjoy your enhanced ShowCall control experience! 🎉*