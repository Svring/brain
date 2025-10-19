"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { searchThreads } from "@/lib/langgraph/langgraph.api";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Handle token check and redirect
  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        const data = await searchThreads({ token });
        console.log(data);
        if (data.length > 0) {
          router.push(`/home?threadId=${data[0]?.thread_id}`);
          return;
        }
      }
      // If no token or no threads found, redirect to home
      router.push("/home");
    };
    fetchData();
  }, [token, router]);

  return <div></div>;
}
