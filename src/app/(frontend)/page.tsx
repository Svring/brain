"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { searchThreads } from "@/lib/langgraph/langgraph.api";

export default function Page() {
    const router = useRouter();
    const [sessionId] = useQueryState("sessionId");
    const [args] = useQueryState("args");

	// Handle sessionId check and redirect
	useEffect(() => {
		const fetchData = async () => {
            if (sessionId) {
                const data = await searchThreads({ sessionId });
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
