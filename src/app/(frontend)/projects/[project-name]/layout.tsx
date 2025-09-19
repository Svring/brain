"use client";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useThreads } from "@/components/provider/thread-provider";
import { useParams } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { createNewThread, selectThread } = useThreads();
  const params = useParams();
  const projectName = params["project-name"] as string;
  const [isCreatingThread, setIsCreatingThread] = useState(true);

  console.log("projectName", projectName);

  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
