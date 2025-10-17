import { type NextRequest, NextResponse } from "next/server";
import { checkPortsReachability } from "@/lib/sealos/services/ports/ports-api";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	if (!url) {
		return NextResponse.json({ error: "URL required" }, { status: 400 });
	}

	try {
		// Parse the URL to extract host and port
		const parsedUrl = new URL(url);
		const host = parsedUrl.hostname;
		const port = parsedUrl.port
			? parseInt(parsedUrl.port)
			: parsedUrl.protocol === "https:"
				? 443
				: 80;

		// First check TCP connectivity using the ports API
		const results = await checkPortsReachability([port], host, 5000);
		const isPortReachable = results[0]?.reachable || false;

		if (!isPortReachable) {
			return NextResponse.json({
				ok: false,
				status: 503,
				statusText: "Port Unreachable",
			});
		}

		// If port is reachable, check if the URL returns a meaningful HTTP response
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			// Try HEAD request first (more efficient)
			let response = await fetch(url, {
				method: "HEAD",
				signal: controller.signal,
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; URL-Checker/1.0)",
				},
			});

			// If HEAD fails, try GET request
			if (!response.ok) {
				clearTimeout(timeoutId);
				const getController = new AbortController();
				const getTimeoutId = setTimeout(() => getController.abort(), 5000);

				response = await fetch(url, {
					method: "GET",
					signal: getController.signal,
					headers: {
						"User-Agent": "Mozilla/5.0 (compatible; URL-Checker/1.0)",
					},
				});
				clearTimeout(getTimeoutId);
			} else {
				clearTimeout(timeoutId);
			}

			// Consider it reachable if we get a meaningful HTTP response (2xx, 3xx, or 4xx)
			// 5xx errors might indicate server issues, but the service is still "reachable"
			const isHttpReachable = response.status >= 200 && response.status < 500;

			return NextResponse.json({
				ok: isHttpReachable,
				status: response.status,
				statusText: response.statusText,
			});
		} catch (httpError) {
			// If HTTP request fails, consider it not reachable
			console.error(`HTTP check failed for ${url}:`, httpError);
			return NextResponse.json({
				ok: false,
				status: 503,
				statusText: "HTTP Request Failed",
				error:
					httpError instanceof Error
						? httpError.message
						: "HTTP request failed",
			});
		}
	} catch (error) {
		console.error("URL check failed:", error);
		return NextResponse.json({
			ok: false,
			status: 503,
			statusText: "Service Unavailable",
			error: error instanceof Error ? error.message : "Failed to check URL",
		});
	}
}
