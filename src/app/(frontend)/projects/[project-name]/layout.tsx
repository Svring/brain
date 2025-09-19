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

  // useEffect(() => {
  //   const createThread = async () => {
  //     try {
  //       setIsCreatingThread(true);

  //       // Create a new thread with metadata indicating it's for this specific project
  //       const thread = await createNewThread.mutateAsync({
  //         metadata: {
  //           page: "project",
  //           project_name: projectName,
  //         },
  //       });

  //       console.log(`Created new thread for project ${projectName}:`, thread);
  //       selectThread(thread.thread_id);
  //     } catch (error) {
  //       console.error(
  //         `Failed to create thread for project ${projectName}:`,
  //         error
  //       );
  //     } finally {
  //       setIsCreatingThread(false);
  //     }
  //   };

  //   if (projectName) {
  //     createThread();
  //   } else {
  //     setIsCreatingThread(false);
  //   }
  // }, [projectName]);

  // Block rendering until thread creation is complete
  // if (isCreatingThread) {
  //   return (
  //     <LoadingScreen
  //       text={`Creating thread for project ${projectName}...`}
  //       variant="bars"
  //       size={24}
  //       className="h-screen w-full"
  //     />
  //   );
  // }

  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
