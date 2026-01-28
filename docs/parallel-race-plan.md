# Plan: Parallel Race Strategy (The "Overdrive" Engine)

Sequential fetching is failing because each delay allows Reddit's WAF to build a fingerprint of the retry pattern. We will pivot to a **Parallel Race** where Tier 0 and Tier 2 (Libreddit) are fired simultaneously.

## 🎯 Objectives
- Minimize time-to-first-byte (TTFB) by picking the fastest healthy instance.
- bypass sequential blocking by flooding multiple entry points.
- Implement a "first-valid-response" logic using `Promise.any()`.

## 🏗️ Architecture
1. **Parallel Race**: Instead of loops, we create a pool of `fetch` promises.
2. **Pool Components**:
    - Our Dedicated Proxy (Tier 0).
    - Hard-coded "Super" Libreddit instances.
3. **Response Validation**: Each promise must validate the JSON schema before resolving to ensure we don't return a "403 HTML" page as a success.

## 📋 Task Breakdown

### Phase 1: Engine Refactoring
- [ ] Modify `src/lib/reddit-api.ts`.
- [ ] Create `fetchRace(path)` function:
    - Initiates 5-10 concurrent requests.
    - Wraps each in a validator that only resolves if data is valid Reddit JSON.
    - Uses `Promise.any()` to return the winner.
- [ ] Keep `fetchWithFallback` as the orchestration layer that handles retries if the *entire* race fails.

### Phase 2: Libreddit Expansion
- [ ] Research and add 5 more high-uptime Libreddit/Redlib instances.

### Phase 3: Cleanup
- [ ] Remove unreliable public proxies from Tier 1 (CORS-Anywhere, etc.) that are consistently failing preflights.

---

**Approval**: Ready to implement the parallel race? (Y/N)
