


let proxyPool: string[] = [];

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
 * Note: Most of these are raw HTTP/SOCKS proxies and require a CORS gateway to be used in a browser.
 * This fetcher is primarily for "Safety" redundancy - gathering potential IP candidates.
 */
export async function fetchPublicProxies(): Promise<string[]> {
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
    proxyPool = unique;
    console.log(`[Ignition] 🛡️ Total Public Proxies in Reserve: ${unique.length}`);
    return unique;
}

