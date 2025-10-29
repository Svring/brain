import axios from "axios";
import parseContentSecurityPolicy from "content-security-policy-parser";
import https from "https";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");
	const regionUrl = searchParams.get("regionUrl");

	if (!url) {
		return NextResponse.json({ error: "URL required" }, { status: 400 });
	}

	try {
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		});

		const refererUrl = `https://brain.${regionUrl}`;

		const result = await axios.get(url, {
			method: "HEAD",
			httpsAgent,
			timeout: 10000,
			headers: {
				Referer: refererUrl,
			},
		});

		const csp = result.headers["content-security-policy"];
		let embedAllowed = false;

		if (csp) {
			try {
				const parsedCSP = parseContentSecurityPolicy(csp);
				const frameAncestors = parsedCSP.get("frame-ancestors");

				if (frameAncestors) {
					embedAllowed = frameAncestors.some((val: string) =>
						val.includes(refererUrl),
					);
				}
			} catch (error) {
				console.error("Failed to parse CSP:", error);
			}
		}

		console.log("response", {
			ok: result.status >= 200 && result.status < 400,
			status: result.status,
			embedAllowed,
		});

		return NextResponse.json({
			ok: result.status >= 200 && result.status < 400,
			status: result.status,
			embedAllowed,
		});
	} catch (error) {
		console.error("Check URL error:", error);
		return NextResponse.json({
			ok: false,
			status: 503,
			error: "fetch failed",
		});
	}
}
