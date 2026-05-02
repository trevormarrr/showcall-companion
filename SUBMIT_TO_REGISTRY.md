# Submitting ShowCall Companion to Bitfocus Companion Module Registry

This guide explains how to officially register your module in the Bitfocus Companion ecosystem so users can discover and install it easily.

## Overview

Once submitted and approved, users will be able to:
- Find the module through Companion's built-in module browser
- Install directly from the Companion UI
- Receive automatic updates
- See it in module repositories and package managers

---

## Prerequisites

Before submitting, ensure:

✅ Repository is public on GitHub  
✅ Module works correctly in Companion  
✅ All documentation is complete and accurate  
✅ package.json and manifest.json are properly configured  
✅ License is clear (MIT)  
✅ No known critical bugs  

**Your repo:** ✓ https://github.com/trevormarrr/showcall-companion

---

## Submission Process

### Option 1: GitHub Module Registry (Recommended)

Bitfocus maintains a module registry on GitHub that automatically indexes public modules.

**Steps:**

1. **Ensure proper manifest configuration**
   - Check `companion/manifest.json` is valid JSON
   - Verify all required fields are present:
     ```json
     {
       "id": "showcall",           // Unique module ID
       "name": "ShowCall",         // Display name
       "version": "2.2.0",         // Must match package.json
       "license": "MIT",           // License type
       "repository": "git+https://github.com/trevormarrr/showcall-companion.git",
       "bugs": "https://github.com/trevormarrr/showcall-companion/issues"
     }
     ```

2. **Create a GitHub Release**
   ```bash
   git tag v2.2.0
   git push origin v2.2.0
   ```
   
   Or via GitHub UI:
   - Go to repository → Releases
   - Click "Create a new release"
   - Tag: `v2.2.0`
   - Title: "ShowCall Companion v2.2.0"
   - Description: See release template below

3. **Submit to Bitfocus Registry**
   - Visit: https://bitfocus.io/modules
   - Click "Submit a module"
   - Provide your repository URL
   - Bitfocus will validate and index it automatically

4. **Wait for Approval**
   - Bitfocus team reviews for quality and security
   - Usually approved within 1-2 weeks
   - May request documentation changes

### Option 2: Direct NPM Registry

Register as an NPM package (optional, for advanced users):

```bash
npm publish
```

Requires:
- NPM account created at https://www.npmjs.com
- Package name uniqueness (already registered: companion-module-showcall)

---

## GitHub Release Template

When creating your v2.2.0 release, use this template:

```markdown
# ShowCall Companion Module v2.2.0

Professional Stream Deck control for ShowCall Resolume integration via Bitfocus Companion.

## What's New

- Clean, production-ready codebase
- Comprehensive installation guide
- Professional contributing guidelines
- Improved documentation and metadata
- All core features stable and tested

## Features

✨ Real-time ShowCall integration via WebSocket  
🎮 Smart visual feedback with multiple feedback types  
🎵 Comprehensive clip, layer, and column control  
🎛️ Automatic preset synchronization with ShowCall  
📊 Live variables for status and monitoring  
🔄 Robust connection management with auto-reconnect  

## Installation

See [INSTALL.md](https://github.com/trevormarrr/showcall-companion/blob/main/INSTALL.md) for:
- Prerequisites and system requirements
- Step-by-step installation instructions
- Configuration guide
- Troubleshooting help

## Getting Started

1. Install Node.js 18.12+
2. Clone: `git clone https://github.com/trevormarrr/showcall-companion.git`
3. Install: `npm install`
4. Add to Companion as developer module
5. Configure ShowCall connection (localhost:3200)

## Documentation

- **[README.md](https://github.com/trevormarrr/showcall-companion#readme)** - Feature overview
- **[INSTALL.md](https://github.com/trevormarrr/showcall-companion/blob/main/INSTALL.md)** - Installation guide
- **[CONTRIBUTING.md](https://github.com/trevormarrr/showcall-companion/blob/main/CONTRIBUTING.md)** - For contributors
- **[CHANGELOG.md](https://github.com/trevormarrr/showcall-companion/blob/main/CHANGELOG.md)** - Version history

## Requirements

- **Bitfocus Companion** 3.0+
- **ShowCall** 1.5.0+ with WebSocket support
- **Node.js** 18.12+

## License

MIT © 2024 Trevor Marr

## Support

- **Issues**: [GitHub Issues](https://github.com/trevormarrr/showcall-companion/issues)
- **Questions**: [GitHub Discussions](https://github.com/trevormarrr/showcall-companion/discussions)
```

---

## Verification Checklist

Before submission, verify:

### Code Quality
- [ ] `npm install` completes without errors
- [ ] No security vulnerabilities: `npm audit`
- [ ] Code follows conventions (consistent style)
- [ ] Comments are clear and helpful

### Configuration
- [ ] `package.json` version matches manifest version
- [ ] `manifest.json` has all required fields
- [ ] Repository URL is correct and public
- [ ] License file is present and valid

### Documentation
- [ ] README.md exists and is comprehensive
- [ ] INSTALL.md covers all installation methods
- [ ] CONTRIBUTING.md guides contributors
- [ ] CHANGELOG.md documents all changes

### Testing
- [ ] Module loads without errors in Companion
- [ ] Connection works to ShowCall
- [ ] Actions execute correctly
- [ ] Feedbacks display properly

### Repository
- [ ] No build artifacts committed
- [ ] .gitignore is comprehensive
- [ ] Git history is clean
- [ ] No sensitive data (API keys, passwords)

---

## Post-Submission

### After Approval

Once your module is approved:

1. **Update README.md** with installation link:
   ```markdown
   ## Installation
   
   Available in Bitfocus Companion:
   - Settings > Connections > "+ Add Connection" > Search "ShowCall"
   ```

2. **Monitor GitHub Issues** for bug reports

3. **Respond to users** seeking help

4. **Plan Updates** - Track requests for v2.3.0

### Maintenance

Keep the module healthy:

- **Security Updates**: Address npm vulnerability warnings
- **Compatibility**: Test with new Companion versions
- **Bug Fixes**: Release patches (v2.2.1) quickly
- **Features**: Plan minor updates (v2.3.0) quarterly
- **Documentation**: Keep guides up-to-date

---

## Common Issues & Solutions

### "Module doesn't appear in registry"
- Verify repository is public
- Wait 24-48 hours for indexing
- Check manifest.json syntax
- Ensure version matches tag

### "Installation fails"
- Run `npm install` before adding to Companion
- Check Node.js version (18.12+ required)
- Verify manifest.json is valid JSON
- Check for circular dependencies

### "No updates available"
- Ensure version is incremented
- Tag release with version (v2.2.0)
- Push tag to GitHub
- Wait for registry sync (can take 24 hours)

---

## Resources

- **Bitfocus Companion**: https://bitfocus.io
- **Module Developer Guide**: https://github.com/bitfocus/companion/blob/main/docs/module_development.md
- **Registry**: https://bitfocus.io/modules
- **Community Forum**: https://community.bitfocus.io

---

## Support

If you encounter issues during submission:

1. **Check Bitfocus Docs** - Most answers are documented
2. **Ask Community** - Post in Bitfocus forums
3. **Email Support** - Contact Bitfocus team
4. **GitHub Issues** - Report module-specific problems

---

## Next Steps

1. ✅ Repository is clean and ready (DONE)
2. Create GitHub release v2.2.0
3. Submit to Bitfocus registry
4. Wait for approval (1-2 weeks)
5. Announce availability to users
6. Monitor for feedback and issues

---

**Your Repository**: https://github.com/trevormarrr/showcall-companion  
**Module ID**: showcall  
**Version**: 2.2.0  
**Status**: Ready for submission ✅

Good luck! 🚀
