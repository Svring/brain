"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { searchThreads } from "@/lib/langgraph/langgraph-api/langgraph-api-service";

export default function Page() {
	const router = useRouter();
	const [query] = useQueryState("query");
	const [sessionId] = useQueryState("sessionId");
	const [args] = useQueryState("args");

	// Handle redirect logic
	useEffect(() => {
		const fetchData = async () => {
			// Case 1: If query is present, navigate directly to home with query
			if (query) {
				const homeUrl = new URL("/home", window.location.origin);
				homeUrl.searchParams.set("query", query);
				router.push(homeUrl.pathname + homeUrl.search);
				return;
			}

			// Case 2: Handle sessionId and args logic
			if (sessionId) {
				console.log("sessionId", sessionId);
				const data = await searchThreads({ sessionId });
				console.log("data", data);
				if (data.length > 0) {
					const homeUrl = new URL("/home", window.location.origin);
					homeUrl.searchParams.set("threadId", data[0]?.thread_id);
					if (args) {
						homeUrl.searchParams.set("args", args);
					}
					router.push(homeUrl.pathname + homeUrl.search);
					return;
				}
			}
			// If no sessionId or no threads found, redirect to home
			const homeUrl = new URL("/home", window.location.origin);
			router.push(homeUrl.pathname + homeUrl.search);
		};
		fetchData();
	}, [query, sessionId, args, router]);

	return <div></div>;
}
