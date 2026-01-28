import { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
    const urlString = new URL(request.url).searchParams.get("url");

    if (!urlString) {
        return new Response(JSON.stringify({ error: "Missing 'url' parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Security: Only allow Reddit and approved Libreddit instances
    const allowedDomains = [
        "reddit.com",
        "old.reddit.com",
        "new.reddit.com",
        "libreddit.spike.codes",
        "safereddit.com",
        "libreddit.northboot.xyz",
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

        console.log(`[Proxy] Routing request to: ${urlString}`);

        const response = await fetch(urlString, {
            method: "GET",
            headers: {
                "User-Agent": randomUA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://www.google.com/",
                "Cache-Control": "max-age=0",
                "Sec-Ch-Ua": '"Not A(Bread;Base";v="99", "Chrome";v="121", "Google Chrome";v="121"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"Windows"',
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "cross-site",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1"
            },
        });

        const data = await response.text();
        const contentType = response.headers.get("content-type") || "text/html";

        return new Response(data, {
            status: response.status,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Cache-Control": "public, max-age=3600",
                "X-Ignite-Target": url.hostname,
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            error: "Fetch failed",
            message: (error as Error).message,
            ignite_status: "network_error"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
