# Contributing to Git Aura 🚀

Welcome to Git Aura! This guide helps new contributors get started.

## What is Git Aura?

Git Aura is a beautiful GitHub profile visualizer that shows your coding achievements with an aura system, leaderboards, and badges.

**Quick Links:**

- [Repository](https://github.com/Anshkaran7/git-aura)
- [Documentation](./docs/)
- [Discussions](https://github.com/Anshkaran7/git-aura/discussions)

## How to Raise an Issue

Found a bug or want a new feature? Here's how to tell us:

1. **Search first** - Look at existing issues to see if someone already reported it
2. **Click "New issue"** - Use the green button on the issues page
3. **Choose type** - Pick "Bug report" or "Feature request"
4. **Write title** - Use format like `bug: login button not working` or `feat: add dark mode`
5. **Fill details** - Include:
   - What you expected to happen
   - What actually happened
   - Steps to reproduce (step by step)
   - Your device info (OS, browser, etc.)
6. **Add screenshots** - If you can, add pictures or code examples
7. **Mention if you want to work on it** - Say "I'd like to work on this" if you want to fix it

**Good issue example:**

```
Title: bug: profile page shows blank on mobile
Description: When I visit a user profile on my phone, the page shows blank.
Steps: 1. Go to /username on mobile 2. Page loads but shows nothing
Expected: Should show user profile like on desktop
Actual: Blank white page
Device: iPhone 14, Safari
```

## How to Make a Pull Request (PR)

Want to fix something or add a feature? Here's how:

1. **Fork the repo** - Click "Fork" button (or create branch if you have access)
2. **Create branch** - Use format: `fix/login-error` or `feat/add-login`
3. **Set up locally** - Run these commands:
   ```bash
   git clone https://github.com/YOUR_USERNAME/git-aura.git
   cd git-aura
   npm install
   npm run dev
   ```
4. **Write code** - Make your changes and add tests if possible
5. **Commit** - Use short message like `fix: correct login bug`
6. **Push and PR** - Push your branch and open a pull request
7. **Fill template** - Use the PR template, link the issue, explain your changes
8. **Wait for review** - We'll review and may ask for changes, then merge

**Timeline:** We try to reply in 2-3 days. If not, ping us again!

## Labels We Use

- `bug` - Something is broken
- `enhancement` - New feature or improvement
- `docs` - Documentation changes
- `good-first-issue` - Good for beginners
- `help-wanted` - We need help with this
- `priority:high` - Important to fix soon

## Code Style & Tests

- Run tests: `npm test`
- Follow basic code style (we use Prettier)
- Test on mobile, tablet, and desktop
- Make sure it looks good on all screen sizes

## Review Process

- We require CI tests to pass (green checkmark)
- We need at least 1 approval from maintainers
- We may ask for changes - don't worry, this is normal!
- Once approved, we'll merge your code

## Thank You! 🙏

Thank you for contributing to Git Aura! Every contribution helps make the project better.

## Contact & Security

- **For security issues:** Contact us privately
- **License:** MIT License - you can use this code freely

---

**Ready to contribute?** Pick an issue labeled `good-first-issue` and get started! 🎉
