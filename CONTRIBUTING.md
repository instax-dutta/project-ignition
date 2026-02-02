# Contributing to Ignition

First off, thank you for considering contributing to Ignition! It's people like you who make it a great tool for the AI community.

## 🌈 Code of Conduct

By participating in this project, you agree to abide by the standard open-source code of conduct, being respectful and constructive in all interactions.

## 🚀 How Can I Contribute?

### Reporting Bugs
* Check the existing issues to see if the bug has already been reported.
* Use a clear and descriptive title for the issue.
* Describe the exact steps which reproduce the problem.

### Suggesting Enhancements
* Open an issue with the tag `enhancement`.
* Explain the use case and why this would be a valuable addition.

### Pull Requests
1. **Fork** the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`npm test`).
5. Make sure your code follows the existing style (we use ESLint and Prettier).

## 🛠️ Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/project-ignition.git

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 📜 Technical Focus
Ignition is built with a focus on:
- **Performance**: High FPS, optimized React rendering.
- **Resilience**: The 'Unbreakable Fetch Engine' is a core piece of tech.
- **Aesthetics**: Vercel-inspired, high-end UI/UX.

## 🔧 Advanced: Contributing Custom Proxy Nodes (Optional)

**Note**: This is for advanced users only. Ignition works perfectly without custom proxies using the built-in public proxy pool and Reddit's public API.

If you want to contribute a custom proxy node to improve resilience:

### Option 1: Custom Hub (localStorage)
1. Run a CORS proxy on your server/RPi:
   ```bash
   export PORT=9999
   npx cors-anywhere
   ```
2. Expose it via Cloudflare Tunnel or DDNS
3. In Ignition console (F12):
   ```javascript
   localStorage.setItem('IGNITION_HUB', 'https://your-proxy-url.com');
   ```

### Option 2: Environment Variable (Deployment)
Add your proxy URL to `VITE_HIDDEN_HUBS` environment variable (comma-separated for multiple):
```
VITE_HIDDEN_HUBS=https://proxy1.example.com,https://proxy2.example.com
```

**Privacy**: Custom hubs are used only by your instance unless you explicitly share them.

---

**Thank you for your contribution!** 🙌
