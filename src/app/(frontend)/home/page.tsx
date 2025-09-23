"use client";

import { Hero } from "@/components/ui/hero";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
import { motion } from "framer-motion";
import { useDeployTemplateDialog } from "@/hooks/brain/use-deploy-template-dialog";
import { useLaunchpadCreateDialog } from "@/hooks/brain/use-launchpad-create-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef } from "react";
import Suggestions from "@/components/chat/components/suggestions";
import RecentProjects from "@/components/project/recent-projects";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { LayoutTemplate, Plus, Loader2 } from "lucide-react";

export default function HomePage() {
  const {
    messages,
    submit,
    stop,
    isLoading,
    threadId,
    createNewChat,
    isCreatingNewChat,
  } = useHomeChat();
  const {
    projects,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useProjectSearch();

  const { DeployTemplateDialog: CreateProjectDialog, openDialog } =
    useDeployTemplateDialog();
  const { LaunchpadCreateDialog } = useLaunchpadCreateDialog();
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  // const hasMessages = messages.length > 0;
  const showMessages = messages.length > 0;
  const hasProjects = projects && projects.length > 0;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <CreateProjectDialog />
      <LaunchpadCreateDialog />
      <div className="flex-1 flex flex-col min-h-0">
        {/* Hero overlays the content area and fades out when messages exist */}
        {!showMessages && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-shrink-0"
          >
            <Hero
              heroTitle="Sealos Brain"
              subtitle="Let development get back to basics - focus on writing code, and let the cloud handle the rest."
              titleClassName="text-4xl md:text-5xl font-extrabold"
              subtitleClassName="text-md md:text-lg max-w-[600px]"
              actionsClassName="mt-2"
            />
          </motion.div>
        )}

        {/* Create New Chat Button - Absolute Top Left */}
        {showMessages && (
          <div className="absolute top-4 left-16 z-10">
            <Button
              onClick={createNewChat}
              variant="outline"
              size="sm"
              className="border-none bg-background! hover:bg-muted"
              disabled={isCreatingNewChat}
            >
              {isCreatingNewChat ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </>
              )}
            </Button>
          </div>
        )}

        {/* Messages area - only visible when there are messages */}
        {showMessages && (
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
                  isLoading={isLoading}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Input - flows naturally in the column */}
        <motion.div
          layout
          initial={!showMessages ? { y: 0, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: showMessages ? 0 : 0.2,
            duration: showMessages ? 0.4 : 0.6,
            ease: "easeOut",
          }}
          className={`flex-shrink-0 ${showMessages ? "pb-8" : "py-0"}`}
        >
          <div className="container mx-auto relative max-w-3xl">
            <AiChatInput
              className={`max-w-3xl${!showMessages ? " min-h-[140px]" : ""}`}
              exhibition={!showMessages}
              onSubmit={submit}
              onStop={stop}
              isLoading={isLoading}
            />
            {!showMessages && (
              <>
                <div className="absolute bottom-2 left-2 right-2 flex gap-2 pointer-events-none">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={openDialog}
                          variant="outline"
                          className="bg-background-tertiary! border-border-primary! pointer-events-auto"
                        >
                          <LayoutTemplate />
                          From Template
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Deploy from app store templates</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Recent Projects or Suggestions section - shown when no messages */}
        {!showMessages &&
          (hasProjects ? (
            <RecentProjects
              projects={projects}
              isLoading={isLoadingProjects}
              isError={isProjectsError}
              displayProjects={projects || []}
            />
          ) : (
            <Suggestions onSubmit={submit} />
          ))}
      </div>
    </div>
  );
}
