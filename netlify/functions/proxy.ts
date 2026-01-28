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

        console.log(`[Proxy] Routing request to: ${urlString}`);

        const response = await fetch(urlString, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": `https://${url.hostname}/`,
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        const data = await response.text();
        const contentType = response.headers.get("content-type") || "application/json";

        return new Response(data, {
            status: response.status,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
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
