"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { searchThreads } from "@/lib/langgraph/langgraph.api";

export default function Page() {
	const router = useRouter();
	const [token] = useQueryState("token");
	const [followup] = useQueryState("followup");

	// Handle token check and redirect
	useEffect(() => {
		const fetchData = async () => {
			if (token) {
				const data = await searchThreads({ token });
				if (data.length > 0) {
					const homeUrl = new URL("/home", window.location.origin);
					homeUrl.searchParams.set("threadId", data[0]?.thread_id);
					if (followup) {
						homeUrl.searchParams.set("followup", followup);
					}
					router.push(homeUrl.pathname + homeUrl.search);
					return;
				}
			}
			// If no token or no threads found, redirect to home
			const homeUrl = new URL("/home", window.location.origin);
			if (followup) {
				homeUrl.searchParams.set("followup", followup);
			}
			router.push(homeUrl.pathname + homeUrl.search);
		};
		fetchData();
	}, [token, router, followup]);

	return <div></div>;
}
