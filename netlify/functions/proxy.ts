import { Context } from "@netlify/functions";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";

export default async (request: Request, context: Context) => {
    const urlString = new URL(request.url).searchParams.get("url");
    const proxyUrl = new URL(request.url).searchParams.get("proxy");

    if (!urlString) {
        return new Response(JSON.stringify({ error: "Missing 'url' parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Security: Only allow Reddit and approved Libreddit/Redlib instances
    const allowedDomains = [
        "reddit.com",
        "old.reddit.com",
        "new.reddit.com",
        "libreddit.spike.codes",
        "safereddit.com",
        "libreddit.northboot.xyz",
        "libreddit.oxymat.com",
        "libreddit.tinfoil-hat.net",
        "libreddit.projectsegfau.lt",
        "redlib.ducks.party",
        "redlib.va.vern.cc",
        "redlib.perennialte.ch",
        "redlib.kittywit.ch",
        "redlib.nonbinary.social",
    ];

    try {
        const url = new URL(urlString);
        const isAllowed = allowedDomains.some(domain => url.hostname.endsWith(domain));

        if (!isAllowed) {
            return new Response(JSON.stringify({
                error: "Domain not allowed",
                domain: url.hostname,
                ignite_status: "blocked_by_policy"
            }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userAgents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        ];
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

        console.log(`[Proxy] Routing request to: ${urlString}${proxyUrl ? ` via ${proxyUrl}` : ""}`);

        const axiosConfig: Record<string, unknown> = {
            method: "get",
            url: urlString,
            headers: {
                "User-Agent": randomUA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://www.google.com/",
            },
            timeout: 5000, // Reduced from 8000ms - fail fast on dead proxies
            validateStatus: () => true,
            responseType: 'text'
        };

        if (proxyUrl) {
            try {
                // Support both http://IP:PORT and just IP:PORT
                const cleanProxy = proxyUrl.includes("://") ? proxyUrl : `http://${proxyUrl}`;

                // Choose agent based on proxy protocol
                if (cleanProxy.startsWith("socks4://") || cleanProxy.startsWith("socks5://") || cleanProxy.startsWith("socks://")) {
                    axiosConfig.httpsAgent = new SocksProxyAgent(cleanProxy);
                    axiosConfig.httpAgent = new SocksProxyAgent(cleanProxy);
                } else {
                    axiosConfig.httpsAgent = new HttpsProxyAgent(cleanProxy);
                    axiosConfig.httpAgent = new HttpsProxyAgent(cleanProxy);
                }
                axiosConfig.proxy = false; // Disable axios default proxy handling
            } catch (proxyError) {
                console.error(`[Proxy] Invalid proxy format: ${proxyUrl}`);
                // Continue without proxy if parsing fails
            }
        }

        const response = await axios(axiosConfig);

        const contentType = response.headers["content-type"] || "text/html";

        return new Response(response.data, {
            status: response.status,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Cache-Control": "public, max-age=3600",
                "X-Ignite-Target": url.hostname,
                "X-Ignite-Proxy": proxyUrl ? "true" : "false",
            },
        });
    } catch (error: unknown) {
        console.error(`[Proxy Error] ${urlString}:`, (error as Error).message);
        return new Response(JSON.stringify({
            error: "Fetch failed",
            message: (error as Error).message,
            ignite_status: "network_error"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
};

