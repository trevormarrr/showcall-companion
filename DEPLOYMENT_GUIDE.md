# Deploying ShowCall Companion v2.2.0

## Quick Deployment Methods

### METHOD 1: Via npm Package (Recommended)

```bash
# 1. Stop Companion (if running)
# In Companion UI: Settings > Restart

# 2. Install from the tarball
cd /path/to/companion/modules
npm install /Users/trevormarr/Apps/showcall-companion/companion-module-showcall-2.2.0.tgz

# 3. Restart Companion
# Settings > Restart or restart the service
```

### METHOD 2: Direct Installation (Development)

```bash
# 1. Copy the module directory to Companion modules folder
# macOS/Linux:
cp -r /Users/trevormarr/Apps/showcall-companion ~/companion-modules/showcall-companion

# Or create a symlink for development:
ln -s /Users/trevormarr/Apps/showcall-companion ~/companion-modules/showcall-companion

# 2. Restart Companion
```

### METHOD 3: Via Companion Web UI

```
1. Open Companion web interface (default: http://localhost:8000)
2. Go to: Settings > Modules > Add Module
3. Choose: "showcall" from the list
4. Wait for installation to complete
5. Restart Companion
```

---

## Finding Your Companion Installation

### macOS
```bash
# Find Companion modules directory
echo $HOME/companion-modules
# or
find ~ -name "companion" -type d 2>/dev/null

# Companion config location:
~/.companion/
```

### Linux
```bash
# Typical locations:
/opt/companion/modules
/home/user/.companion/modules
/usr/share/companion/modules

# Find with:
locate companion-modules
# or
find /opt /home -name "companion*" -type d 2>/dev/null
```

### Windows
```cmd
REM Typical locations:
C:\Program Files\Companion\modules
C:\Users\%USERNAME%\AppData\Local\companion\modules

REM Or find with:
dir /s %APPDATA%\companion
```

---

## Step-by-Step Deployment Guide

### Step 1: Locate Companion Modules Directory
```bash
# Find where Companion is installed
# Check Companion UI: Settings > Log Files
# Look for module paths in the logs

# Or search:
find ~ -type d -name "node_modules" | grep companion
```

### Step 2: Backup Current Installation (Optional)
```bash
cd /path/to/companion/modules
cp -r showcall-companion showcall-companion.backup
```

### Step 3: Deploy the New Version

**Option A: Extract tarball directly**
```bash
cd /path/to/companion/modules
tar -xzf /Users/trevormarr/Apps/showcall-companion/companion-module-showcall-2.2.0.tgz -C showcall-companion
```

**Option B: Replace entire directory**
```bash
cd /path/to/companion/modules
rm -rf showcall-companion
tar -xzf /Users/trevormarr/Apps/showcall-companion/companion-module-showcall-2.2.0.tgz -C .
mv . showcall-companion  # if needed
```

**Option C: Use npm directly**
```bash
cd /path/to/companion/modules/showcall-companion
npm install
```

### Step 4: Restart Companion
```bash
# Via UI: Settings > Restart
# Or restart the service:
systemctl restart companion    # Linux
brew services restart companion # macOS
net stop companion && net start companion # Windows
```

### Step 5: Verify Installation
```bash
# Check version:
grep version /path/to/companion/modules/showcall-companion/package.json

# Should output: "version": "2.2.0"

# Check Companion logs for:
# ✅ "ShowCall: Connected"
# ✅ "Creating N dynamic preset buttons from ShowCall"
```

---

## Via Docker (If Using Docker)

```bash
# Build image with new version
docker build -t companion:2.2.0 .

# Or mount the module directory
docker run -v /Users/trevormarr/Apps/showcall-companion:/app/modules/showcall-companion companion:latest

# Restart container
docker restart companion
```

---

## Verifying Deployment Success

### Check 1: Module Loads
In Companion UI:
- Settings > Module List
- Look for "showcall" with version 2.2.0
- Status should show: "Configured"

### Check 2: Variables Available
In Companion UI:
- Edit a button
- Add action: "ShowCall"
- In text field, type: `$(showcall:preset_1_name)`
- Should autocomplete and appear

### Check 3: Test Real-Time Updates
1. Create a test button with: `$(showcall:preset_1_name)`
2. Connect to ShowCall
3. Change preset name in ShowCall
4. Button text should update within 1 second
5. ✅ Deployment successful!

---

## Troubleshooting Deployment Issues

### Issue: Module not loading
```bash
# Check for errors in Companion logs
tail -f ~/.companion/logs/companion.log | grep showcall

# Verify tarball extracted correctly
ls -la /path/to/companion/modules/showcall-companion/main.js
```

### Issue: Variables not showing
```bash
# Restart Companion completely
killall node
# Wait 5 seconds
# Restart Companion service
```

### Issue: Old version still loaded
```bash
# Clear Companion cache
rm -rf ~/.companion/cache
rm -rf ~/.companion/.modulecache

# Restart Companion
```

### Issue: Module errors in logs
```bash
# Check syntax
node -c /path/to/companion/modules/showcall-companion/main.js

# Install dependencies
cd /path/to/companion/modules/showcall-companion
npm install
```

---

## Rollback to v2.1.1 (If Needed)

```bash
# If you have backup
cd /path/to/companion/modules
rm -rf showcall-companion
mv showcall-companion.backup showcall-companion

# Or reinstall v2.1.1 from npm
npm install @companion-module/showcall@2.1.1

# Restart Companion
```

---

## File Locations Reference

### macOS
```
Module installed: ~/.companion/modules/showcall-companion/
Config: ~/.companion/
Logs: ~/.companion/logs/
```

### Linux (Typical)
```
Module installed: /home/user/.companion/modules/showcall-companion/
Config: /home/user/.companion/
Logs: /home/user/.companion/logs/
```

### Windows
```
Module installed: C:\Users\USERNAME\AppData\Local\companion\modules\showcall-companion\
Config: C:\Users\USERNAME\AppData\Local\companion\
Logs: C:\Users\USERNAME\AppData\Local\companion\logs\
```

---

## Quick Command Reference

```bash
# Complete deployment (macOS/Linux)
cd /path/to/companion/modules && \
rm -rf showcall-companion && \
tar -xzf /Users/trevormarr/Apps/showcall-companion/companion-module-showcall-2.2.0.tgz && \
mv showcall-companion-main showcall-companion && \
systemctl restart companion

# Verify after deployment
grep version /path/to/companion/modules/showcall-companion/package.json
tail -f ~/.companion/logs/companion.log | grep -i showcall
```

---

## Support

After deployment:
- Check Companion logs for any errors
- Verify module version is 2.2.0
- Test with a preset button: `$(showcall:preset_1_name)`
- Confirm real-time updates work

If issues occur, check the logs in:
`~/.companion/logs/companion.log` (macOS/Linux)
or
`%APPDATA%\companion\logs\companion.log` (Windows)
