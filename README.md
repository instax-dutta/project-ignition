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

## 📦 Deployment (Netlify)

Ignition is pre-configured for **one-click deployment on Netlify**.

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`
- **Redirects**: Automatically handled by `netlify.toml` for Single Page Application (SPA) routing and API proxying.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/instax-dutta/project-ignition)

---

## 🏗️ Architecture: How it works

### 1. Topic Mapping
Ignition uses a weighted scoring algorithm (`findRelevantSubreddits`) to map your intent to the best communities.

### 2. Unbreakable Fetch Engine
Ignition implements a multi-tier defense strategy to bypass blocks and ensure content delivery:
- **Tier 0**: **Reddit Public API** - Direct access to Reddit's public JSON endpoints (no authentication required)
- **Tier 1**: **Dedicated Serverless Proxy Bridge** (Netlify Functions) - Custom infrastructure with header rotation
- **Tier 2**: **Public Proxy Pool** - Automatically validated proxies from community sources
- **Tier 3**: **Libreddit/Redlib Instances** - Privacy-focused Reddit frontends as fallback
- **Tier 4**: **CORS Proxies** - Public gateways for additional redundancy

### 3. TOON Format
Content is transformed from messy JSON into a structured, token-efficient notation:
- Strips redundant metadata
- Preserves author identity and thread depth
- Formats dates and scores for LLM reasoning

### 4. Proxy Health System
Ignition automatically validates proxies before use to ensure high success rates:
- Tests proxies against health check endpoints
- Caches healthy proxies for 1 hour
- Filters out dead, slow, or auth-required proxies

---

## 🛡️ Privacy & Safety Resources
Ignition uses public proxy sources to maintain fetch resilience. Special thanks to:
- **[Bes-js/public-proxy-list](https://github.com/Bes-js/public-proxy-list)**: Continuous feed of public proxies
- **[TheSpeedX/SOCKS-List](https://github.com/TheSpeedX/SOCKS-List)**: SOCKS proxy aggregation
- **[monosans/proxy-list](https://github.com/monosans/proxy-list)**: HTTP proxy collection

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
