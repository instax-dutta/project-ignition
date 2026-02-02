/**
 * Proxy Health Checker
 * Tests proxies before adding them to the pool to improve success rates
 */

interface ProxyTestResult {
    proxy: string;
    healthy: boolean;
    responseTime?: number;
    error?: string;
}

const TEST_ENDPOINT = 'https://httpbin.org/ip';
const TEST_TIMEOUT = 8000; // 8 seconds max per proxy test
const BATCH_SIZE = 10; // Test 10 proxies at a time

/**
 * Test a single proxy by making a request through the Netlify bridge
 */
async function testProxy(proxyUrl: string, bridgeUrl: string = '/api/proxy'): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
        const testUrl = `${bridgeUrl}?url=${encodeURIComponent(TEST_ENDPOINT)}&proxy=${encodeURIComponent(proxyUrl)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

        const response = await fetch(testUrl, {
            signal: controller.signal,
            headers: {
                'X-Health-Check': 'true'
            }
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        // Consider proxy healthy if:
        // 1. Response is 200 OK
        // 2. Response time < 8s
        // 3. Response contains valid JSON with IP
        if (response.ok && responseTime < TEST_TIMEOUT) {
            try {
                const data = await response.json();
                if (data.origin || data.ip) {
                    return {
                        proxy: proxyUrl,
                        healthy: true,
                        responseTime
                    };
                }
            } catch {
                // JSON parse failed, proxy might be working but returning wrong format
            }
        }

        return {
            proxy: proxyUrl,
            healthy: false,
            error: `HTTP ${response.status}`
        };

    } catch (error: unknown) {
        return {
            proxy: proxyUrl,
            healthy: false,
            error: error instanceof Error ? (error.name === 'AbortError' ? 'Timeout' : error.message) : 'Unknown error'
        };
    }
}

/**
 * Test multiple proxies in batches
 */
export async function filterHealthyProxies(
    proxies: string[],
    bridgeUrl: string = '/api/proxy',
    onProgress?: (tested: number, total: number, healthy: number) => void
): Promise<string[]> {
    const healthyProxies: string[] = [];
    let testedCount = 0;

    console.log(`[ProxyHealth] 🏥 Testing ${proxies.length} proxies...`);

    // Process in batches to avoid overwhelming the network
    for (let i = 0; i < proxies.length; i += BATCH_SIZE) {
        const batch = proxies.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
            batch.map(proxy => testProxy(proxy, bridgeUrl))
        );

        results.forEach((result, index) => {
            testedCount++;

            if (result.status === 'fulfilled' && result.value.healthy) {
                healthyProxies.push(result.value.proxy);
                console.log(
                    `[ProxyHealth] ✅ ${result.value.proxy.substring(0, 25)}... (${result.value.responseTime}ms)`
                );
            } else if (result.status === 'fulfilled') {
                console.log(
                    `[ProxyHealth] ❌ ${result.value.proxy.substring(0, 25)}... (${result.value.error})`
                );
            }

            if (onProgress) {
                onProgress(testedCount, proxies.length, healthyProxies.length);
            }
        });

        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < proxies.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    const successRate = ((healthyProxies.length / proxies.length) * 100).toFixed(1);
    console.log(
        `[ProxyHealth] 🏁 Health check complete: ${healthyProxies.length}/${proxies.length} healthy (${successRate}%)`
    );

    return healthyProxies;
}

/**
 * Quick health check for a smaller sample (useful for periodic validation)
 */
export async function quickHealthCheck(
    proxies: string[],
    sampleSize: number = 20
): Promise<{ healthy: string[]; successRate: number }> {
    const sample = proxies.slice(0, Math.min(sampleSize, proxies.length));
    const healthy = await filterHealthyProxies(sample);
    const successRate = (healthy.length / sample.length) * 100;

    return { healthy, successRate };
}
