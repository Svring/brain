"use client";

import { Hero } from "@/components/ui/hero";
import { AiChatInput } from "@/components/chat/ai-input";
import { AiMessages } from "@/components/chat/ai-messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { motion } from "framer-motion";
import useCopilotActions from "@/hooks/copilot/use-copilot-actions";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import RecentProjects from "@/components/project/recent-projects";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";

export default function HomePage() {
  const { messages } = useCopilotChatHeadless_c({ id: "chat" });
  const hasMessages = messages.length > 0;
  const { filteredProjects, projects, isLoading, isError } = useProjectSearch();

  // const { setStage } = useLanggraphActions();

  useCopilotActions();
  useLanggraphAgent();

  // setStage("project");

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
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
              subtitle="We have lingered in the chambers of the sea. By sea-girls wreathed with seaweed red and brown"
              titleClassName="text-5xl md:text-6xl font-extrabold"
              subtitleClassName="text-lg md:text-xl max-w-[600px]"
              actionsClassName="mt-4"
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
            <div className="flex-1 overflow-y-auto pt-8">
              <div className="max-w-3xl mx-auto w-full">
                <AiMessages />
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
          <div className="container mx-auto px-4">
            <AiChatInput className="max-w-3xl mx-auto" />
          </div>
        </motion.div>

        {/* Projects section - hidden when messages appear */}
        {!hasMessages && (
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
