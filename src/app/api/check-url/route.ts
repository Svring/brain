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

		// Do a GET request and accept any status without throwing
		const result = await axios.request({
			url: url!,
			method: "GET",
			httpsAgent,
			timeout: 10000,
			headers: {
				Referer: refererUrl,
			},
			validateStatus: () => true,
			// Return raw data as string if possible
			transformResponse: (r) => r,
		});

		const status = result.status;
		const bodyText = typeof result.data === "string" ? result.data : "";
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
			}
		}

		const lower = bodyText.toLowerCase();
		const isUpstreamError =
			status === 502 ||
			lower.includes("upstream connect error") ||
			lower.includes("disconnect/reset");

		const ok = status >= 200 && status < 400 && !isUpstreamError;

		return NextResponse.json({
			ok,
			status,
			embedAllowed,
			isUpstreamError,
		});
	} catch (error) {
		return NextResponse.json({
			ok: false,
			status: 503,
			error: "fetch failed",
			isUpstreamError: false,
		});
	}
}
