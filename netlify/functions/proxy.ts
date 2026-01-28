import { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
    const url = new URL(request.url).searchParams.get("url");

    if (!url) {
        return new Response(JSON.stringify({ error: "No URL provided" }), {
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
        const targetUrl = new URL(url);
        const isAllowed = allowedDomains.some(domain => targetUrl.hostname.endsWith(domain));

        if (!isAllowed) {
            return new Response(JSON.stringify({ error: "Domain not allowed" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log(`[Proxy] Fetching: ${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
                "Cache-Control": "public, max-age=3600", // Edge cache for 1 hour
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
