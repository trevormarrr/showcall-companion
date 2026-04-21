# 🐛 CRITICAL BUG FIX - v2.1.1 Module Dependencies

## Problem
After upgrading to v2.1.1, Companion showed:
- "Router Configuration (error)" in the config UI
- "Error starting connection: Error: Module not found: 'showcall'" in logs
- Unable to configure host/port settings

## Root Cause
The `.npmignore` file was excluding `node_modules/`, which meant the packaged module (`.tgz` file) **did not include the required dependencies** (`@companion-module/base`, `ws`, etc.). This caused Companion to fail when trying to load the module.

## Solution Applied

### 1. Fixed `.npmignore`
Commented out the `node_modules/` exclusion:
```
# Dependencies - DO NOT IGNORE node_modules! Companion needs them bundled
# node_modules/  <-- COMMENTED OUT - Companion modules need dependencies included!
package-lock.json
```

### 2. Added `bundledDependencies` to `package.json`
```json
"bundledDependencies": [
  "@companion-module/base",
  "ws"
]
```

This explicitly tells npm to include all dependencies and their sub-dependencies in the package.

### 3. Reverted manifest.json Changes
The original `manifest.json` settings were correct:
- `"api": "nodejs-ipc"` ✅
- `"apiVersion": "0.0.0"` ✅

The "Router Configuration" error was misleading - it was actually caused by missing dependencies, not the API configuration.

## Package Size Comparison
- **Before (broken):** 411 KB - missing dependencies
- **After (fixed):** 2.5 MB - includes all 26 bundled dependencies

## Files Modified
1. `.npmignore` - Commented out node_modules exclusion
2. `package.json` - Added bundledDependencies array
3. `companion/manifest.json` - Reverted to original v2.1.0 settings

## Installation
The new `companion-module-showcall-2.1.1.tgz` now works correctly:

1. **Delete** the old ShowCall module instance from Companion
2. **Restart** Companion
3. **Install** the new `companion-module-showcall-2.1.1.tgz`
4. **Add** a new ShowCall connection
5. **Configure** Host (default: localhost) and Port (default: 3200)

## Verification
You can verify the package includes dependencies:
```bash
tar -tzf companion-module-showcall-2.1.1.tgz | grep node_modules | head -5
```

Should show files like:
```
package/node_modules/@companion-module/base/...
package/node_modules/ws/...
```

## Lesson Learned
**Companion modules MUST include their dependencies in the package.** Unlike regular npm packages that install dependencies separately, Companion expects a fully self-contained module with all dependencies bundled.

---
**Fixed:** February 15, 2026
**Version:** 2.1.1-fixed
