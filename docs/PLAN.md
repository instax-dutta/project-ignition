# Project Ignition Rebranding Plan

This plan outlines the steps to rebrand the current project to **Ignition** and optimize it for Netlify hosting.

## Phase 1: Planning & Analysis ⏳
- [x] Identify all instances of "Lovable" branding.
- [x] Identify all instances of "Reddit Context Extractor" branding.
- [x] Define new brand identity: **Ignition**.
- [x] Define new motto: *"Ignition to Ultimate Information of Reddit access to LLMs through token optimised files"*.

## Phase 2: Brand Overhaul 🎨
### 1. Remove Lovable Branding
- **Files**: `package.json`, `vite.config.ts`, `index.html`.
- **Action**: Remove `lovable-tagger` dependency and plugin. Remove Lovable-hosted OG images.

### 2. Branding & Content Updates
- **Files**: `index.html`, `src/pages/Index.tsx`, `src/pages/Templates.tsx`.
- **Action**: 
    - Rename "Reddit Context Extractor" to **Ignition**.
    - Update motto in Hero section and meta tags.
    - Update header and footer branding.
    - Update SEO keywords and descriptions.

### 3. Asset Generation
- **Action**: Generate new brand assets using AI.
    - `public/favicon.ico`: High-tech "Ignition" themed icon.
    - `public/logo.svg`: Minimalist "Ignition" logo.
    - `public/og-image.png`: Professional brand preview for social sharing.

## Phase 3: Technical Optimization 🚀
### 1. Netlify Optimization
- **File**: `netlify.toml`.
- **Action**: Create a Netlify configuration file to handle SPA routing (redirect all paths to `index.html`) and set build settings.
- **Verification**: Ensure `dist` directory is correctly identified.

### 2. Build & Cleanup
- **Action**: Remove unused assets (if any) and ensure a clean production build.
- **Verification**: Run `npm run build` to verify the build process.

## Phase 4: Final Review & Deployment ✅
- [ ] Verify all branding changes in a local dev server.
- [ ] Run security and lint scans.
- [ ] Final handoff for Netlify deployment.

---

**Orchestration Details:**
- **Phase 1**: Orchestrator (Current)
- **Phase 2 Implementation**: `frontend-specialist`, `documentation-writer`
- **Phase 3 Implementation**: `devops-engineer`
- **Verification**: `test-engineer`
