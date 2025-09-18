"use client";

import { Hero } from "@/components/ui/hero";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
import { motion } from "framer-motion";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import RecentProjects from "@/components/project/recent-projects";
import { useProjectCreateDialog } from "@/hooks/brain/use-project-create-dialog";
import { useLaunchpadCreateDialog } from "@/hooks/brain/use-launchpad-create-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef, useState, useEffect } from "react";
import { proposeProjectAction } from "@/lib/copilot/brain/project/copilot-project-actions";
import Suggestions from "@/components/chat/components/suggestions";
import { useChatState } from "@/contexts/chat/chat-context";
import { useThreads } from "@/components/provider/thread-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useThreadStateAtCheckpoint } from "@/hooks/langgraph/use-thread-state-at-checkpoint";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useMount } from "@reactuses/core";
import { SearchWebActionMessage } from "@/components/copilot/langgraph/search-web-action-message";

export default function HomePage() {
  const {
    createNewThread,
    getThreads,
    setThreads,
    selectThread,
    messages,
    setMessages,
    selectedThreadId,
    isStreaming,
    setIsStreaming,
  } = useThreads();

  // Dummy web search data for testing
  const dummyWebSearchData = {
    query: "Next.js best practices 2024",
    follow_up_questions: [
      "What are the latest Next.js 14 features?",
      "How to optimize Next.js performance?",
      "Next.js vs React comparison",
    ],
    answer:
      "Next.js 14 introduces improved performance with the App Router, enhanced TypeScript support, and better developer experience with features like Server Components and improved caching strategies.",
    images: [],
    results: [
      {
        url: "https://nextjs.org/docs",
        title: "Next.js Documentation - The React Framework for Production",
        content:
          "Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more. No config needed.",
        score: 0.95,
        raw_content: null,
      },
      {
        url: "https://vercel.com/blog/nextjs-14",
        title: "Next.js 14: Turbopack, Server Actions, and More",
        content:
          "Next.js 14 is here with major improvements including Turbopack for faster builds, Server Actions for better data mutations, and enhanced performance optimizations.",
        score: 0.88,
        raw_content: null,
      },
      {
        url: "https://blog.logrocket.com/nextjs-best-practices/",
        title: "Next.js Best Practices for 2024 - LogRocket Blog",
        content:
          "Learn the essential Next.js best practices including proper file structure, performance optimization, SEO techniques, and deployment strategies for production applications.",
        score: 0.82,
        raw_content: null,
      },
    ],
    response_time: 1.2,
    request_id: "test-request-123",
  };
  const {
    filteredProjects,
    projects,
    isLoading: projectsLoading,
    isError,
  } = useProjectSearch();
  const { CreateProjectDialog, openDialog } = useProjectCreateDialog();
  const { LaunchpadCreateDialog, openDialog: openLaunchpadDialog } =
    useLaunchpadCreateDialog();
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  // Create thread on mount for home page
  useMount(() => {
    // Always clear messages and create a new thread on mount
    console.log(
      "[HomePage] Clearing messages and creating new thread on mount..."
    );

    // Clear messages first
    setMessages([]);

    // Create a new thread and select it
    createNewThread.mutate(undefined, {
      onSuccess: (data: any) => {
        if (data?.thread_id) {
          selectThread(data.thread_id);
          // Refresh threads list
          getThreads().then((threads) => {
            setThreads(threads);
          });
        }
      },
      onError: (error: any) => {
        console.error("[HomePage] Failed to create thread on mount:", error);
      },
    });
  });

  // Track visibility of recent projects
  const showRecentProjects = !hasMessages && projects && projects.length > 0;
  // const showRecentProjects = false;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <CreateProjectDialog />
      <LaunchpadCreateDialog />
      <div className="flex-1 flex flex-col min-h-0">
        {/* Hero overlays the content area and fades out when messages exist */}
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-shrink-0"
          >
            <Hero
              heroTitle="Sealos Brain"
              subtitle="The old oak tree whispered to the breeze, 'I've seen centuries pass, but your fleeting touch feels like a secret only we share.'"
              titleClassName="text-5xl md:text-6xl font-extrabold"
              subtitleClassName="text-lg md:text-xl max-w-[600px]"
              actionsClassName="mt-2"
            />
          </motion.div>
        )}

        {/* Messages area - only visible when there are messages */}
        {hasMessages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div
              ref={messagesScrollRef}
              className="flex-1 overflow-y-auto py-8"
            >
              <div className="max-w-3xl mx-auto w-full">
                <AiMessages
                  scrollRef={messagesScrollRef}
                  messages={messages}
                  isLoading={isStreaming}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Input - flows naturally in the column */}
        <motion.div
          layout
          initial={!hasMessages ? { y: 0, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: hasMessages ? 0 : 0.2,
            duration: hasMessages ? 0.4 : 0.6,
            ease: "easeOut",
          }}
          className={`flex-shrink-0 ${hasMessages ? "pb-8" : "py-0"}`}
        >
          <div className="container mx-auto relative max-w-3xl">
            <AiChatInput
              className={`max-w-3xl${!hasMessages ? " min-h-[140px]" : ""}`}
              exhibition={!hasMessages}
            />
            {!hasMessages && (
              <>
                <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={openDialog}
                          variant="outline"
                          className="bg-background-tertiary! border-border-primary!"
                        >
                          From template
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Deploy from app store templates</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={openLaunchpadDialog}
                          variant="outline"
                          className="bg-background-tertiary! border-border-primary!"
                        >
                          From image
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Deploy from docker image</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button
                            variant="outline"
                            disabled
                            className="bg-background-secondary! border-border-primary!"
                          >
                            Start anew
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Allocate resources for a new project</p>
                      </TooltipContent>
                    </Tooltip> */}
                  </TooltipProvider>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Projects section - hidden when messages appear */}
        {showRecentProjects && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              delay: 0.8, // Wait for input box to slide into place (0.2s delay + 0.6s duration)
              duration: 0.7,
              ease: "easeOut",
            }}
            className="flex-shrink-0"
          >
            <RecentProjects
              projects={projects}
              isLoading={projectsLoading}
              isError={isError}
              displayProjects={filteredProjects.slice(0, 3)}
            />
          </motion.div>
        )}

        {/* Suggestions section - shown when recent projects are not visible and not loading */}
        {/* {!hasMessages && !showRecentProjects && !projectsLoading && (
          <Suggestions />
        )} */}
        {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              delay: 0.8,
              duration: 0.7,
              ease: "easeOut",
            }}
            className="flex-shrink-0 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-center text-muted-foreground">
                  Web Search Demo
                </h3>
                <p className="text-sm text-center text-muted-foreground mt-1">
                  Example of how web search results are displayed
                </p>
              </div>
              <SearchWebActionMessage result={dummyWebSearchData} />
            </div>
          </motion.div> */}
      </div>
    </div>
  );
}
