"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useThreads } from "@/components/provider/thread-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthState } from "@/contexts/auth/auth-context";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { createNewThread, selectThread } = useThreads();
  const [isCreatingThread, setIsCreatingThread] = useState(true);
  const [hasCreatedThread, setHasCreatedThread] = useState(false);
  const { auth } = useAuthState();

  useEffect(() => {
    const createThread = async () => {
      if (!auth?.kubeconfig || hasCreatedThread) {
        setIsCreatingThread(false);
        return;
      }

      try {
        setIsCreatingThread(true);

        // Create a new thread with metadata indicating it's for the home page
        const thread = await createNewThread.mutateAsync({
          metadata: { kubeconfig: auth?.kubeconfig },
        });

        console.log("Created new thread for home page:", thread);
        setHasCreatedThread(true);
        selectThread(thread.thread_id);
      } catch (error) {
        console.error("Failed to create thread for home page:", error);
      } finally {
        setIsCreatingThread(false);
      }
    };

    createThread();
  }, [auth?.kubeconfig, hasCreatedThread]);

  // Block rendering until thread creation is complete
  if (isCreatingThread) {
    return (
      <LoadingScreen variant="bars" size={24} className="h-screen w-full" />
    );
  }

  return <>{children}</>;
}
