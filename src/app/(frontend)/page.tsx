"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { searchThreads } from "@/lib/langgraph/langgraph-api/langgraph-api-service";

export default function Page() {
  const router = useRouter();
  const { auth } = useAuthState();
  const [query] = useQueryState("query");
  const [trial] = useQueryState("trial");
  const [sessionId] = useQueryState("sessionId");
  const [args] = useQueryState("args");

  // Handle redirect logic
  useEffect(() => {
    const fetchData = async () => {
      // Case 1: If query or trial is present, navigate directly to home with appropriate params
      if (query || trial) {
        const homeUrl = new URL("/home", window.location.origin);
        if (query) {
          homeUrl.searchParams.set("query", query);
        }
        if (trial) {
          homeUrl.searchParams.set("trial", trial);
        }
        router.push(homeUrl.pathname + homeUrl.search);
        return;
      }

      // Case 2: Handle sessionId and args logic
      if (sessionId) {
        const data = await searchThreads({ sessionId }, auth?.kubeconfig);
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
  }, [query, trial, sessionId, args, router]);

  return <div></div>;
}
