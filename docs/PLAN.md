# Plan: Motion & Flow Integration (Ignition)

This plan outlines the implementation of global smooth scrolling using Lenis and a premium animation system using Framer Motion to enhance the "Old Money" high-aesthetic feel of the project.

## 🏗️ Architecture

### 1. Global Scrolling (Lenis)
- **Setup**: Install `lenis` and implement a global `SmoothScroll` provider.
- **Config**: Optimize for high-refresh-rate displays and touch devices.
- **Integration**: Ensure compatibility with existing `react-router-dom` navigation.

### 2. Animation System (Framer Motion)
- **Library**: Install `framer-motion`.
- **Patterns**:
  - **Entrance Animations**: Staggered fade-ins for feature cards and search results.
  - **Interaction States**: Scale and glow effects for search input and thread cards.
  - **Page Transitions**: Subtle opacity shifts between the Search and Templates pages.

## 🛠️ Step-by-Step Implementation

### Phase A: Foundation
1. Install dependencies: `lenis`, `framer-motion`.
2. Create `src/components/providers/SmoothScroll.tsx` utilizing Lenis.
3. Wrap the main application in `App.tsx` or `main.tsx` with the provider.

### Phase B: Core Animations
1. **Hero Section**: Implement staggered entrance for the title, tagline, and search bar.
2. **Search Bar**: Add Framer Motion to the "Extract" button and suggestion chips for smooth hover/active states.
3. **Results**: Implement a "Spring" animation for thread cards as they appear in the grid.

### Phase C: Polish & Performance
1. Configure Lenis to stop scrolling when modals (Thread Preview) are open.
2. Optimize Framer Motion usage (e.g., `layout` prop) to prevent layout shifts.

## 🧪 Verification Criteria
- [ ] Smooth scrolling is active across all long-form content.
- [ ] Feature cards animate in sequentially on page load.
- [ ] Search results "pop" in with a spring effect instead of a hard jump.
- [ ] No performance regressions in Lighthouse (target 95+ performance).

## 👥 Agents Involved
1. **project-planner**: Architectural design (Current).
2. **frontend-specialist**: Implementation of components and motion logic.
3. **performance-optimizer**: Lenis fine-tuning and bundle analysis.
4. **test-engineer**: Final verification and linting.
