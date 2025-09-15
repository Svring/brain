"use client";

import { Hero } from "@/components/ui/hero";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
import { motion } from "framer-motion";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import RecentProjects from "@/components/project/recent-projects";
import { useProjectCreateDialog } from "@/hooks/brain/use-project-create-dialog";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { proposeProjectAction } from "@/lib/copilot/brain/project/copilot-project-actions";
import Suggestions from "@/components/chat/components/suggestions";
import { useChatState } from "@/contexts/chat/chat-context";
import { useLanggraphStream } from "@/contexts/langgraph/langgraph-context";
import { useThreads } from "@/hooks/langgraph/use-threads";
import { useMount } from "@reactuses/core";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function HomePage() {
  const { selectedThreadId } = useChatState();
  const {
    filteredProjects,
    projects,
    isLoading: projectsLoading,
    isError,
  } = useProjectSearch();
  const { CreateProjectDialog, openDialog } = useProjectCreateDialog();
  const { createNewThread } = useThreads();
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { messages, submit, stop, isLoading } = useLanggraphStream();

  // Create a new thread on mount
  useMount(() => {
    createNewThread.mutate(undefined, {
      onSuccess: () => {
        setTimeout(() => {
          setIsInitializing(false);
        }, 1000);
      },
      onError: () => {
        setTimeout(() => {
          setIsInitializing(false);
        }, 1000);
        setIsInitializing(false);
      },
    });
  });

  const hasMessages = messages.length > 0;

  // Track visibility of recent projects
  const showRecentProjects = !hasMessages && projects && projects.length > 0;
  // const showRecentProjects = false;

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen text="Initializing..." />;
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <CreateProjectDialog />
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
                  messages={messages}
                  isLoading={isLoading}
                  scrollRef={messagesScrollRef}
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
              // submit={submit}
              stop={stop}
              isLoading={isLoading}
            />
            {!hasMessages && (
              <>
                <Button
                  onClick={openDialog}
                  variant="outline"
                  className="absolute bottom-2 left-2 bg-background-tertiary! border-border-primary!"
                >
                  From template
                </Button>
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
        {!hasMessages && !showRecentProjects && !projectsLoading && (
          <Suggestions />
        )}
      </div>
    </div>
  );
}
