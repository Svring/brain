"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { searchThreads } from "@/lib/langgraph/langgraph-api/langgraph-api-service";

export default function Page() {
	const router = useRouter();
	const [sessionId] = useQueryState("sessionId");
	const [args] = useQueryState("args");

	console.log("sessionId", sessionId);
	console.log("args", args);

	// Handle sessionId check and redirect
	useEffect(() => {
		const fetchData = async () => {
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
			if (args) {
				homeUrl.searchParams.set("args", args);
			}
			router.push(homeUrl.pathname + homeUrl.search);
		};
		fetchData();
	}, [sessionId, args]);

	return <div></div>;
}
