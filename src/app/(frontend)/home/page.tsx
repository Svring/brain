"use client";

import { Hero } from "@/components/ui/hero";
import { AiChatInput } from "@/components/chat/ai-input";
import { AiMessages } from "@/components/chat/ai-messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { motion } from "framer-motion";
import useCopilotActions from "@/hooks/copilot/use-copilot-actions";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import RecentProjects from "@/components/project/recent-projects";

export default function HomePage() {
  const { messages } = useCopilotChatHeadless_c({ id: "chat" });
  const hasMessages = messages.length > 0;

  const context = createK8sContext();

  const { filteredProjects, projects, isLoading, isError } =
    useProjectSearch(context);

  useCopilotActions();
  useLanggraphAgent();

  // Create a content key that changes when message content actually changes
  const contentKey = messages
    .map((m) => `${m.id}-${m.content?.length || 0}-${m.role}`)
    .join("|");

  const { scrollRef, disableAutoScroll } = useAutoScroll({
    offset: 50,
    smooth: true,
    content: contentKey,
  });

  // Show maximum 3 projects
  const displayProjects = filteredProjects.slice(0, 3);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Hero overlays the content area and fades out when messages exist */}
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className=" flex flex-col"
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
            className="flex-1 flex flex-col"
          >
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto pt-8 pb-4"
              onScroll={disableAutoScroll}
              onWheel={disableAutoScroll}
              onTouchMove={disableAutoScroll}
            >
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
          className={hasMessages ? "py-8" : "py-0"}
        >
          <div className="container mx-auto px-4">
            <AiChatInput className="max-w-3xl mx-auto" />
          </div>
        </motion.div>

        {/* Projects section - hidden when messages appear */}
        {!hasMessages && (
          <RecentProjects
            projects={projects}
            isLoading={isLoading}
            isError={isError}
            displayProjects={displayProjects}
          />
        )}
      </div>
    </div>
  );
}
