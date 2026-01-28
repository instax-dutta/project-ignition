# Plan: Residential Proxy Hub (RPi Integration)

This plan outlines the integration of a Raspberry Pi "Residential Proxy" to bypass Reddit's WAF and improve fetching success rates from ~10% to ~95%.

## 🏗️ Architecture

### 1. Residential Proxy (RPi)
- **Software**: `cors-anywhere` running via Node.js.
- **Access**: Villa's RPi (`villa@villa.local`) on the local network.
- **Port**: 8080 (default).
- **Security**: Cloudflare Tunnel for secure, worldwide exposure without port forwarding.

### 2. Ignition Integration
- **Mechanism**: `localStorage` override of the `IGNITION_HUB` variable.
- **Priority**: High. If a hub is detected, it becomes the primary racer in the Parallel Race Engine.

## 🛠️ Step-by-Step Implementation

### Phase A: RPi Setup (Villa@villa.local)
1. **Connectivity**: Verify SSH access and network visibility.
2. **Environment**: Ensure `node` and `npm` are installed on the RPi.
3. **Execution**: Run `npx cors-anywhere` on the RPi and confirm the port.
4. **Tunneling**: Instructions for user to point Cloudflare Tunnel to the RPi's local IP and port.

### Phase B: Project Integration
1. **API Update**: (Completed) `src/lib/reddit-api.ts` already supports `localStorage.getItem('IGNITION_HUB')`.
2. **Hub Config UI**: (Optional) Add a small "Hub Status" indicator or settings modal to the Ignition UI for easier management.

### Phase C: Verification & Scaling
1. **Race Test**: Perform a search and verify if "HomeHub" wins the race in the console logs.
2. **Latency Check**: Measure the Cloudflare Tunnel overhead (target < 300ms).

## 🧪 Verification Criteria
- [ ] RPi successfully responds to cross-origin requests.
- [ ] `IGNITION_HUB` correctly prepends requests to Reddit.
- [ ] Console logs show `[Ignition] HomeHub won the race!`.
- [ ] Thread extraction works for subreddits that were previously 403'ing.

## 👥 Agents Involved
1. **project-planner**: Architectural design (Current).
2. **devops-engineer**: RPi setup, SSH execution, and Cloudflare Tunnel logic.
3. **backend-specialist**: Proxy optimization and header spoofing.
4. **frontend-specialist**: Hub management UI integration.
