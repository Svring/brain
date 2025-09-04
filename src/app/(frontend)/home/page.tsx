"use client";

import { Hero } from "@/components/ui/hero";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { motion } from "framer-motion";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import RecentProjects from "@/components/project/recent-projects";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";
import { useMount } from "@reactuses/core";
import { useProjectCreateDialog } from "@/hooks/brain/use-project-create-dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { proposeProjectAction } from "@/lib/copilot/brain/project/copilot-project-actions";

export default function HomePage() {
  const { messages } = useCopilotChatHeadless_c();
  const hasMessages = messages.length > 0;
  const { filteredProjects, projects, isLoading, isError } = useProjectSearch();
  const { setStage } = useLanggraphActions();
  const { CreateProjectDialog, openDialog } = useProjectCreateDialog();
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  proposeProjectAction();
  useLanggraphAgent();

  useMount(() => {
    setStage("propose_project");
  });

  // console.log("projects", projects);

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
                <AiMessages scrollRef={messagesScrollRef} />
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
            delay: hasMessages ? 0 : 0.3,
            duration: hasMessages ? 0.4 : 0.8,
            ease: "easeOut",
          }}
          className={`flex-shrink-0 ${hasMessages ? "pb-8" : "py-0"}`}
        >
          <div className="container mx-auto relative max-w-3xl">
            <AiChatInput
              className={`max-w-3xl${!hasMessages ? " min-h-[140px]" : ""}`}
            />
            {!hasMessages && (
              <Button
                onClick={openDialog}
                variant="outline"
                className="absolute bottom-2 left-2"
              >
                From template
              </Button>
            )}
          </div>
        </motion.div>

        {/* Projects section - hidden when messages appear */}
        {!hasMessages && projects && projects.length > 0 && (
          <div className="flex-shrink-0">
            <RecentProjects
              projects={projects}
              isLoading={isLoading}
              isError={isError}
              displayProjects={filteredProjects.slice(0, 3)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
