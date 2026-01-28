# 🔥 Ignition

**Ignition to Ultimate Information of Reddit access to LLMs through token optimised files (TOON format) through human not direct api endpoints for ai agents.**

Ignition is a high-performance extraction engine designed to bridge the gap between Reddit's massive knowledge base and Large Language Models (LLMs). It captures deep conversation context, preserves thread hierarchy, and optimizes the content for agentic ingestion using the **TOON (Token Optimized Object Notation)** format.

Live at: **[ignition.sdad.pro](https://ignition.sdad.pro)**

---

## 🚀 The Mission

Most LLM scrapers fail because they treat Reddit like a flat document. Ignition treats it like a **knowledge graph**. By preserving the "human" quality of discussions without requiring complex API integrations or expensive tokens, Ignition allows AI agents to access the true "context" of a topic.

## ✨ Key Features

- **🧠 Intelligent Subreddit Discovery**: Semantic mapping of topics to a curated database of high-signal communities.
- **📉 TOON Optimizer**: Reduces token usage by 50-70% via strategic removal of noise while maintaining 100% semantic integrity.
- **🛡️ Unbreakable Fetch Engine**: A four-tier resilience system that uses a dedicated serverless bridge, official Reddit hosts, CORS proxies, and Libreddit failovers to guarantee 99.9% uptime.
- **✨ Premium Motion System**: Integrated **Lenis** for tactile smooth scrolling and **Framer Motion** for graceful, staggered UI transitions.
- **💎 Elegant Aesthetic**: A Vercel-inspired, old-money monochrome design built for sophisticated users and professional developers.
- **⚡ Zero Config**: No Reddit API tokens, no accounts, no obstacles.

## 🛠️ Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) + [React 18](https://reactjs.org/)
- **Backend**: [Netlify Functions](https://www.netlify.com/products/functions/) (Edge Proxy)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Scrolling**: [Lenis](https://lenis.darkroom.engineering/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query (v5)](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)

---


## 💻 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0+)
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/instax-dutta/project-ignition.git

# Enter the project directory
cd project-ignition

# Install dependencies
npm install

# Start development server (includes Netlify Functions if Netlify CLI is installed)
npm run dev
```

---

### 🌐 IGNITION GRID (Community Proxies)
To make Ignition robust for everyone, we maintain a list of community-hosted residential proxies.
**Your hub is already live!** We support adding any number of hidden hubs via environment variables.


**To contribute another node:**
1. Run `npx cors-anywhere` on your RPi/Server (Port 9999 recommended).
2. Expose it via Cloudflare Tunnel or DDNS.
3. Submit a PR adding your URL to `src/lib/reddit-api.ts`.

These community nodes are used by all users as a high-priority lane to bypass Reddit's blocks. High quality, non-commercial use only.

## 📦 Deployment (Netlify)

Ignition is pre-configured for **one-click deployment on Netlify**.

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`
- **Redirects**: Automatically handled by `netlify.toml` for Single Page Application (SPA) routing and API proxying.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/instax-dutta/project-ignition)

---

---

## 🏠 Residential Mode (RPi Hub)

If Reddit aggressively blocks cloud IPs (Netlify/Vercel), you can activate **Residential Mode** by hosting a tiny proxy on your home network (e.g., Raspberry Pi).

1.  **Run on RPi** (Port 9999):
    ```bash
    export PORT=9999
    nohup npx cors-anywhere > proxy.log 2>&1 &
    ```
2.  **Expose**: Use Cloudflare Tunnel to point a public URL (e.g., `https://hub.yoursite.com`) to `localhost:9999`.
3.  **Activate**:
    Open Ignition console (F12) and run:
    ```javascript
    localStorage.setItem('IGNITION_HUB', 'https://hub.yoursite.com');
    ```
    To disable: `localStorage.removeItem('IGNITION_HUB')`.

### 🌐 IGNITION GRID (Community Proxies)
To make Ignition robust for everyone, we use a grid of community-hosted residential proxies.

**To contribute a node:**
1. Run `npx cors-anywhere` on your RPi/Server (Port 9999 recommended).
2. Expose it via Cloudflare Tunnel or DDNS.
3. Configure it as a `VITE_HIDDEN_HUBS` environment variable in your deployment (comma-separated).
4. **Safety & Privacy**: We verify hubs via our Grid Protocol.

### 🛡️ Privacy & Safety Resources
Ignition monitors public proxy sources to maintain the health of the grid. Special thanks to these projects for their open datasets:
- **[Bes-js/public-proxy-list](https://github.com/Bes-js/public-proxy-list)**: Continuous feed of public proxies.
- **[chill117/proxy-lists](https://github.com/chill117/proxy-lists)**: Comprehensive proxy aggregation.


This allows the community to share resources securely without exposing exact locations publicly.

## 🏗️ Architecture: How it works

### 1. Topic Mapping
Ignition uses a weighted scoring algorithm (`findRelevantSubreddits`) to map your intent to the best communities.

### 2. Unbreakable Fetch Engine
Ignition implements a four-tier defense strategy to bypass blocks and ensure content delivery:
- **Tier 0**: **Dedicated Serverless Proxy Bridge** (Netlify Functions). Our own infrastructure with custom header rotation and edge caching.
- **Tier 1**: Official Reddit host rotation (www, old, new) via public CORS proxies as fallback.
- **Tier 2**: Dynamic failover to **Libreddit** and **Safereddit** instances.
- **Tier 3**: Recursive deep distribution with exponential backoff.

### 3. TOON Format
Content is transformed from messy JSON into a structured, token-efficient notation:
- Strips redundant metadata.
- Preserves author identity and thread depth.
- Formats dates and scores for LLM reasoning.

---

## 🤝 Contributing

We welcome contributions! Whether it's adding new subreddit mappings, improving the TOON compression, or refining the UI.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## �️ Roadmap & Todo

- [ ] **Redis Caching**: Implement weekly caching for Reddit results to reduce proxy load and improve speed.
- [ ] **Smart Refresh**: Automatically update cached data on subsequent user searches for the same topic.
- [ ] **Advanced Filtering**: More granular control over search results (by author, flair, etc.).

---

## �📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Ignition — Fueling the next generation of AI agents with deep human context.**
