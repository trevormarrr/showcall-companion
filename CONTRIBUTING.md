# Contributing to ShowCall Companion Module

Thank you for your interest in contributing! This document provides guidelines for contributing to the ShowCall Companion module.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Report issues responsibly
- Follow best practices

## Ways to Contribute

### Reporting Bugs

Found a bug? Please report it using GitHub Issues:

1. **Check existing issues** - Avoid duplicates
2. **Provide details:**
   - ShowCall version
   - Companion version
   - Node.js version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages or logs
3. **Include examples** - Code snippets, screenshots, etc.

### Suggesting Enhancements

Have an idea? Share it:

1. **Check existing issues/discussions** - Avoid duplicates
2. **Create GitHub Discussion** - Start with your idea
3. **Provide context** - Use case, benefits, examples
4. **Be specific** - Clear requirements and expectations

### Pull Requests

Want to contribute code?

1. **Fork the repository** on GitHub
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** - Keep commits focused and meaningful
4. **Follow code style:**
   - Use existing code as reference
   - Use consistent indentation (2 spaces)
   - Add comments for complex logic
   - Test your changes
5. **Update documentation** if needed
6. **Submit PR with description:**
   - What does it do?
   - Why is it needed?
   - Any related issues?
   - Testing done?

### Documentation

Help improve documentation:

1. Fix typos or clarify confusing sections
2. Add examples or use cases
3. Improve error messages
4. Update installation guides

## Development Setup

### Prerequisites

- Node.js 18.12+
- Bitfocus Companion 3.0+
- ShowCall 1.5.0+
- Git

### Local Development

1. **Clone and install:**
   ```bash
   git clone https://github.com/trevormarr/showcall-companion.git
   cd showcall-companion
   npm install
   ```

2. **Add as developer module in Companion:**
   - Settings → Developer modules → Add module path
   - Select the cloned folder

3. **Start developing:**
   - Make changes to `main.js` or other files
   - Restart Companion to test changes
   - Check browser console for errors

4. **Test thoroughly:**
   - Test with ShowCall running
   - Test connection failures
   - Test all feedback types
   - Test all actions

### Key Files

- `main.js` - Main module logic, actions, feedbacks, variables
- `index.js` - Entry point (simple re-export)
- `manifest.json` - Module metadata (in `companion/` folder)
- `package.json` - Dependencies and metadata
- `README.md` - User documentation
- `CHANGELOG.md` - Version history

## Code Style Guide

### Module Structure

```javascript
class ShowCallInstance extends InstanceBase {
  // Constructor
  constructor(internal) { }
  
  // Lifecycle
  async init(config) { }
  async destroy() { }
  
  // Initialization methods
  initActions() { }
  initFeedbacks() { }
  initVariables() { }
  initPresets() { }
  
  // WebSocket handling
  connectWebSocket() { }
  
  // Actions/Feedbacks implementation
  myAction() { }
  myFeedback() { }
  
  // Helpers
  helperMethod() { }
}
```

### Naming Conventions

- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Methods**: `camelCase`
- **Classes**: `PascalCase`
- **Private methods**: `_methodName()`

### Comments

```javascript
// Single line comments for brief explanations

/**
 * Multi-line for functions
 * @param {type} name - Description
 * @returns {type} Description
 */
function doSomething(name) { }

// TODO: Note future improvements
// FIXME: Note bugs or issues
```

## Testing

### Manual Testing

1. **Connection:**
   - Test localhost connection
   - Test network connection
   - Test wrong host/port handling
   - Test reconnection after disconnect

2. **Actions:**
   - Test each action with various parameters
   - Test with ShowCall not running
   - Test rapid-fire actions
   - Test edge cases (layer 0, column 99, etc.)

3. **Feedbacks:**
   - Verify each feedback type works
   - Test visual feedback updates
   - Test with clips playing/stopped
   - Test color accuracy

4. **Variables:**
   - Verify all variables display correctly
   - Test updates in real-time
   - Test with zero values
   - Test with special characters

### Automated Testing (Future)

When adding tests:

```bash
npm test
```

## Commit Messages

Follow conventional commit format:

```
type(scope): brief description

Detailed explanation of changes.
- Point 1
- Point 2

Fixes #123
```

**Types**: feat, fix, docs, style, refactor, test, chore  
**Scope**: main, presets, feedback, action, etc.

## Release Process

### Version Numbers

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH**
- `2.0.0` - Major breaking changes
- `2.1.0` - New features (backward compatible)
- `2.1.1` - Bug fixes

### Releases

1. **Update version** in `package.json` and `manifest.json`
2. **Update CHANGELOG.md** with changes
3. **Create GitHub Release** with tag `v2.x.x`
4. **Add release notes** and package file

## Questions?

- **GitHub Discussions**: Ask questions publicly
- **GitHub Issues**: Report problems
- **Email**: trevormarrr@users.noreply.github.com

---

Thank you for contributing to ShowCall Companion! 🎉

**Module**: ShowCall Companion v2.2.0  
**License**: MIT
