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

			// Parse headers for iframe embedding policy
			// X-Frame-Options: DENY | SAMEORIGIN | ALLOW-FROM <uri>
			const xfo = response.headers.get("x-frame-options");
			// Content-Security-Policy: frame-ancestors 'none' | 'self' | https://example.com ...
			const csp = response.headers.get("content-security-policy");

			const computeEmbedAllowed = (): boolean => {
				// If service is not reachable, embedding is not applicable
				if (!isHttpReachable) return false;

				// Check X-Frame-Options first (legacy but still widely used)
				if (xfo) {
					const val = xfo.trim().toUpperCase();
					if (val.includes("DENY")) return false;
					if (val.includes("SAMEORIGIN")) {
						// SAMEORIGIN blocks embedding from different origins. Our app is a different origin for most cases.
						return false;
					}
					// ALLOW-FROM is non-standard and deprecated; most browsers ignore it.
					// We'll be conservative and treat it as blocked unless it matches our origin (which we don't know here).
				}

				// Check CSP frame-ancestors
				if (csp) {
					// Find frame-ancestors directive
					const directive = csp
						.split(";")
						.map((d) => d.trim())
						.find((d) => d.toLowerCase().startsWith("frame-ancestors"));
					if (directive) {
						const value = directive.substring("frame-ancestors".length).trim();
						// If 'none' then never allowed
						if (/['"]?none['"]?/i.test(value)) return false;
						// If only 'self' or specific origins are present, and we are not that origin, treat as blocked.
						// Without knowing our runtime origin here, be conservative and mark blocked when directive exists and is restrictive.
						// Many sites specify explicit origins; to avoid false-negatives we treat presence of directive as potentially blocking.
						return false;
					}
				}

				// If neither header blocks embedding, assume allowed
				return true;
			};

			const embedAllowed = computeEmbedAllowed();

			return NextResponse.json({
				ok: isHttpReachable,
				status: response.status,
				statusText: response.statusText,
				embedAllowed,
				headers: {
					xFrameOptions: xfo,
					contentSecurityPolicy: csp,
				},
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
