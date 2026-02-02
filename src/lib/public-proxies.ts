
import { filterHealthyProxies } from './proxy-health-checker';

let proxyPool: string[] = [];
let lastHealthCheck: number = 0;
const HEALTH_CHECK_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Returns the currently discovered public proxies.
 */
export function getProxyPool(): string[] {
    return proxyPool;
}

const PROXY_SOURCES = [
    'https://raw.githubusercontent.com/Bes-js/public-proxy-list/main/proxies.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt'
];


/**
 * Fetches public proxies from community lists.
 * Optionally validates proxies with health checks.
 * 
 * @param validateProxies - If true, runs health checks on fetched proxies (slower but higher quality)
 * @param onProgress - Optional callback for health check progress
 */
export async function fetchPublicProxies(
    validateProxies: boolean = false,
    onProgress?: (tested: number, total: number, healthy: number) => void
): Promise<string[]> {
    const allProxies: string[] = [];

    console.log('[Ignition] 🛡️ UPDATING PUBLIC PROXY DEFENSE LIST...');

    for (const source of PROXY_SOURCES) {
        try {
            const response = await fetch(source);
            if (!response.ok) continue;

            const text = await response.text();
            // Parse IP:PORT format
            const lines = text.split('\n')
                .map(l => l.trim())
                .filter(l => l && !l.startsWith('#') && l.includes(':'));

            allProxies.push(...lines);
            console.log(`[Ignition] 🛡️ Fetched ${lines.length} proxies from ${source}`);
        } catch (err) {
            console.warn(`[Ignition] ⚠️ Failed to fetch proxy list from ${source}`, err);
        }
    }

    // Deduplicate
    const unique = [...new Set(allProxies)];
    console.log(`[Ignition] 🛡️ Total Public Proxies Fetched: ${unique.length}`);

    // Optional health check validation
    if (validateProxies && unique.length > 0) {
        const now = Date.now();

        // Skip health check if we did one recently
        if (now - lastHealthCheck < HEALTH_CHECK_CACHE_DURATION && proxyPool.length > 0) {
            console.log('[Ignition] 🏥 Using cached healthy proxies (recent health check)');
            return proxyPool;
        }

        console.log('[Ignition] 🏥 Running health checks on proxies (this may take a minute)...');
        const healthyProxies = await filterHealthyProxies(unique, '/api/proxy', onProgress);

        proxyPool = healthyProxies;
        lastHealthCheck = now;

        console.log(`[Ignition] ✅ Healthy Proxies Ready: ${healthyProxies.length}`);
        return healthyProxies;
    }

    // No validation - use all proxies
    proxyPool = unique;
    console.log(`[Ignition] 🛡️ Total Public Proxies in Reserve: ${unique.length}`);
    return unique;
}

