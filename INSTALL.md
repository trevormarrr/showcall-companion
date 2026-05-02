# Installation Guide - ShowCall Companion Module

This guide covers all installation methods for the ShowCall Companion module in Bitfocus Companion.

## Prerequisites

Before installing, ensure you have:

1. **Node.js 18.12+** - [Download from nodejs.org](https://nodejs.org/)
   - Test: Run `node --version` in terminal
   
2. **Bitfocus Companion 3.0+** - [Download from bitfocus.io](https://bitfocus.io/)
   - Download and install for your platform
   
3. **ShowCall 1.5.0+** - Must have WebSocket support enabled
   - WebSocket is enabled by default in ShowCall
   - Verify it's running on port 3200 (default)

---

## Installation Methods

### Method 1: Developer Module (Recommended for Development)

Best for development or testing. Allows live code updates.

**Steps:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/trevormarr/showcall-companion.git
   cd showcall-companion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This creates a `node_modules` folder with required packages.

3. **Open Bitfocus Companion** and navigate to Settings (gear icon)

4. **Go to Developer modules section:**
   - Click **Settings** → **Developer modules**
   - Click **"Add module"**
   - Select the `showcall-companion` folder you cloned
   - Click **Select**

5. **Restart Companion:**
   - Companion will automatically restart
   - Wait 10-15 seconds for it to fully restart

6. **Add the ShowCall connection:**
   - Go to the **Connections** tab
   - Click **"+ Add Connection"**
   - Search for **"ShowCall"** in the module list
   - Click to add it
   - Configure connection settings (see below)
   - Click **Save**

---

### Method 2: Direct Module Installation (Production)

For installing a stable release version.

**macOS/Linux:**

1. **Extract the module package:**
   ```bash
   # Navigate to Companion's modules directory
   cd ~/Library/Application\ Support/Companion/modules/
   
   # Or on Linux:
   # cd ~/.local/share/Companion/modules/
   
   # Extract the module
   tar -xzf /path/to/companion-module-showcall-2.2.0.tgz
   
   # Rename folder
   mv package companion-module-showcall
   ```

2. **Restart Companion** - It will detect the new module

3. **Add ShowCall connection** - See step 6 above

**Windows:**

1. **Find Companion modules directory:**
   - Usually: `%APPDATA%\Companion\modules\`
   - Or: `C:\Users\[YourUsername]\AppData\Roaming\Companion\modules\`

2. **Extract the package:**
   - Right-click `companion-module-showcall-2.2.0.tgz`
   - Use 7-Zip or similar to extract
   - Create folder: `companion-module-showcall`
   - Extract contents into that folder

3. **Restart Companion**

4. **Add ShowCall connection** - See configuration below

---

### Method 3: Automated Scripts

**macOS/Linux:**
```bash
# Run the installation script
./install.sh
```

**Windows:**
```cmd
# Run the installation batch file
install.bat
```

These scripts will:
1. Check for Node.js
2. Install dependencies
3. Show next steps

---

## Configuration

### ShowCall Connection Settings

Once the module is installed, configure the connection:

1. **Open Companion** → **Connections** tab
2. **Add Connection** → Search "ShowCall"
3. **Configure settings:**

   | Setting | Default | Description |
   |---------|---------|-------------|
   | **Host** | `localhost` | IP/hostname of ShowCall machine |
   | **Port** | `3200` | WebSocket port (matches ShowCall config) |

4. **Test connection:**
   - If successful, status shows **"Connected"** in green
   - If failed, check troubleshooting section below

### Connection Examples

**Same Machine:**
- Host: `localhost`
- Port: `3200`

**Different Machine on Network:**
- Host: `192.168.1.100` (or your machine's IP)
- Port: `3200`

**Remote Connection:**
- Host: `showcall.example.com` (if publicly accessible)
- Port: `3200`

---

## Verification

After installation, verify everything works:

1. **Check connection status:**
   - Go to Connections tab
   - ShowCall should show "Connected" status in green

2. **Test with presets:**
   - Go to Buttons tab
   - Look for ShowCall presets
   - Drag a preset to a Stream Deck button
   - Button should show connection status

3. **Test an action:**
   - Create a new button
   - Add "ShowCall" action (e.g., "Play Clip")
   - Configure the action
   - Click the button - should trigger in ShowCall

---

## Troubleshooting

### "Cannot connect to ShowCall"

**Cause**: Connection refused or timeout  
**Solutions**:
1. Verify ShowCall is running
2. Check host/port configuration (default: localhost:3200)
3. If on different machines, use IP address instead of localhost
4. Check firewall isn't blocking port 3200
5. Verify ShowCall version is 1.5.0+

```bash
# Test connection from terminal (macOS/Linux)
nc -zv localhost 3200

# Should show: Connection to localhost port 3200 [tcp/*] succeeded!
```

### "Module not found" error

**Cause**: Dependencies not installed  
**Solution**:
1. Open terminal in module folder
2. Run `npm install`
3. Restart Companion
4. Re-add the module

### Feedback/Buttons not updating

**Cause**: Module needs to restart  
**Solutions**:
1. Remove ShowCall connection from Connections tab
2. Restart Companion
3. Re-add ShowCall connection
4. Wait 5 seconds for reconnection

### "Failed to get module api version"

**Cause**: Node dependencies missing  
**Solution**:
1. Stop Companion
2. Delete `node_modules` folder (if exists)
3. Run `npm install` in module folder
4. Restart Companion

### Companion won't start after adding module

**Cause**: Module error or dependency issue  
**Solution**:
1. Remove the module folder
2. Run `npm install` in the removed folder (externally)
3. Add it back to Companion

---

## Updating the Module

### From Git (Development)

```bash
cd /path/to/showcall-companion
git pull origin main
npm install  # Install any new dependencies
```
Then restart Companion.

### From Package (Production)

1. Remove the current `companion-module-showcall` folder
2. Extract the new package version
3. Restart Companion

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Node.js** | 18.12 | 20+ (LTS) |
| **Companion** | 3.0 | 3.2+ |
| **ShowCall** | 1.5.0 | 2.0+ |
| **RAM** | 512 MB | 2 GB |
| **Network** | 10 Mbps | 100 Mbps (local) |
| **Disk** | 50 MB | 200 MB |

---

## Next Steps

After successful installation:

1. **Explore presets** - Browse ShowCall presets in Buttons tab
2. **Create buttons** - Add ShowCall actions to Stream Deck
3. **Configure feedback** - Set up visual indicators
4. **Test connection** - Verify control from buttons
5. **Read advanced guide** - See README.md for advanced features

---

## Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/trevormarr/showcall-companion/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/trevormarr/showcall-companion/discussions)
- **Companion Documentation**: [bitfocus.io](https://bitfocus.io)
- **ShowCall Support**: Check ShowCall documentation for WebSocket issues

---

**Last Updated**: February 2026  
**Module Version**: 2.2.0  
**License**: MIT
