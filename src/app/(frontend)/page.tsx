"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { searchThreads } from "@/lib/langgraph/langgraph.api";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const followup = searchParams.get("followup");

  // Handle token check and redirect
  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        const data = await searchThreads({ token });
        console.log(data);
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
