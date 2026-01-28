# Plan: Serverless Proxy Bridge (Option A)

To resolve the catastrophic proxy failure (403/429 loops), we will transition from using public CORS proxies to a dedicated, project-local proxy hosted via **Netlify Functions**.

## 🎯 Objectives
- Eliminate "net::ERR_NAME_NOT_RESOLVED" and "CORS policy" errors from untrusted public proxies.
- Control User-Agent and Header spoofing at the edge.
- Implement a primary fetching tier that is nearly impossible for Reddit to block due to controlled request rates and high-reputation IPs.

## 🏗️ Architecture
1. **Edge API**: A Netlify function located at `netlify/functions/proxy.ts`.
2. **Path**: Accessible via `/.netlify/functions/proxy` (aliased to `/api/proxy`).
3. **Frontend Integration**: `reddit-api.ts` will prioritize this local endpoint before falling back to external proxies.

## 📋 Task Breakdown

### Phase 1: Infrastructure & Backend
- [ ] Create `netlify/functions/proxy.ts`.
- [ ] Implement logic to:
    - Validate the requested URL (must be a reddit.com or libreddit domain).
    - Rotate User-Agents.
    - Inject `X-Requested-With: XMLHttpRequest`.
    - Handle both JSON and Raw responses.
    - Set `Access-Control-Allow-Origin: *` (or specific for our domain).
- [ ] Update `netlify.toml` to alias the function path to `/api/proxy`.

### Phase 2: Frontend Integration
- [ ] Modify `src/lib/reddit-api.ts`:
    - Define `LOCAL_PROXY = '/api/proxy?url='`.
    - Update `fetchWithFallback` to try `LOCAL_PROXY` first.
    - Maintain existing proxy list as Tier 2 redundancy.

### Phase 3: Verification & Security
- [ ] Test the function locally using Netlify CLI (`netlify dev`).
- [ ] Audit for "Open Proxy" vulnerabilities (ensure only specific domains can be proxied).

## 🛡️ Security Considerations
- We will restrict the proxy to ONLY fetch from `*.reddit.com` and our approved `LIBREDDIT_INSTANCES` to prevent abuse by external actors.

---

**Approval Required**: Should I proceed with creating the Netlify Function and updating the fetch engine? (Y/N)
