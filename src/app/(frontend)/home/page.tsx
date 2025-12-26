"use client";

import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Code2,
  Database,
  LayoutGrid,
  LayoutTemplate,
  Loader2,
  Plus,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
// import { QuickShortcuts } from "@/components/chat/components/quick-shortcuts";
import Suggestions from "@/components/chat/components/suggestions";
import RecentProjects from "@/components/project/recent-projects";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Hero } from "@/components/ui/hero";
import { Spinner } from "@/components/ui/spinner";
import { useDeployTemplateDialog } from "@/hooks/brain/use-deploy-template-dialog";
import { useLaunchpadCreateDialog } from "@/hooks/brain/use-launchpad-create-dialog";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { useDevenvDeployment } from "@/hooks/langgraph/use-devenv-deployment";
import { useImageDeployment } from "@/hooks/langgraph/use-image-deployment";
import { useTemplateDeployment } from "@/hooks/langgraph/use-template-deployment";
import { getQuickShortcutIcon } from "@/lib/quick-shortcuts/quick-shortcuts-icons";
import { AVAILABLE_CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";

export default function HomePage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const {
    messages,
    submit,
    stop,
    isLoading,
    createNewChat,
    isCreatingNewChat,
    threadId,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [argsParam] = useQueryState("args");
  const [query] = useQueryState("query");
  const hasAutoSubmitted = useRef(false);

  // Get and store user name from sessionData
  useEffect(() => {
    const getSessionData = async () => {
      createSealosApp();
      const sessionData = await sealosApp.getSession();
      if (sessionData?.user?.name) {
        setUserName(sessionData.user.name);
      }
    };
    getSessionData();
  }, []);

  // Parse args from query (JSON string)
  const parsedArgs = useMemo(() => {
    if (!argsParam) return null;
    try {
      const parsed = JSON.parse(decodeURIComponent(argsParam));
      return parsed;
    } catch (error) {
      console.error("[Args Detection] Failed to parse args:", error);
      return null;
    }
  }, [argsParam]);

  // Determine arg shape
  const isTemplateArgs = useMemo(() => {
    const result = Boolean(
      parsedArgs &&
        typeof parsedArgs === "object" &&
        typeof parsedArgs.template_name === "string" &&
        parsedArgs.template_name.length > 0
    );
    return result;
  }, [parsedArgs]);

  const isImageArgs = useMemo(() => {
    const hasOriginalFormat =
      parsedArgs &&
      typeof parsedArgs === "object" &&
      typeof parsedArgs.image_name === "string" &&
      parsedArgs.image_name.length > 0 &&
      typeof parsedArgs.project_name === "string" &&
      parsedArgs.project_name.length > 0 &&
      typeof parsedArgs.name === "string" &&
      parsedArgs.name.length > 0;

    const hasProposalFormat =
      parsedArgs &&
      typeof parsedArgs === "object" &&
      typeof parsedArgs.name === "string" &&
      parsedArgs.name.length > 0 &&
      parsedArgs.resources &&
      typeof parsedArgs.resources === "object" &&
      Array.isArray(parsedArgs.resources.app) &&
      parsedArgs.resources.app.length > 0 &&
      typeof parsedArgs.resources.app[0]?.image === "string" &&
      parsedArgs.resources.app[0].image.length > 0;

    const result = Boolean(hasOriginalFormat || hasProposalFormat);
    return result;
  }, [parsedArgs]);

  const isDevenvArgs = useMemo(() => {
    const hasOriginalFormat =
      parsedArgs &&
      typeof parsedArgs === "object" &&
      typeof parsedArgs.project_name === "string" &&
      parsedArgs.project_name.length > 0 &&
      (Array.isArray(parsedArgs.devbox) || Array.isArray(parsedArgs.database));

    const hasProposalFormat =
      parsedArgs &&
      typeof parsedArgs === "object" &&
      typeof parsedArgs.name === "string" &&
      parsedArgs.name.length > 0 &&
      parsedArgs.resources &&
      typeof parsedArgs.resources === "object" &&
      (Array.isArray(parsedArgs.resources.devbox) ||
        Array.isArray(parsedArgs.resources.database));

    const result = Boolean(hasOriginalFormat || hasProposalFormat);
    return result;
  }, [parsedArgs]);

  // Prepare args for hooks with safe defaults
  const imageArgs = isImageArgs
    ? // Transform ProjectProposal format to expected args format if needed
      parsedArgs.resources?.app &&
      Array.isArray(parsedArgs.resources.app) &&
      parsedArgs.resources.app.length > 0
      ? {
          image_name: parsedArgs.resources.app[0].image,
          project_name: parsedArgs.name,
          name: parsedArgs.resources.app[0].name,
          ports:
            parsedArgs.resources.app[0].ports?.map(
              (p: { number: number }) => p.number
            ) || [],
        }
      : parsedArgs
    : { image_name: "", project_name: "", name: "", ports: [] };

  const devenvArgs = isDevenvArgs
    ? // Transform nested resources structure to flat structure if needed
      parsedArgs.resources
      ? {
          project_name: parsedArgs.name,
          devbox:
            parsedArgs.resources.devbox?.map((devbox: any) => ({
              ...devbox,
              // Transform ports from { number, publicAccess } to just number[]
              ports: Array.isArray(devbox.ports)
                ? devbox.ports.map((p: any) =>
                    typeof p === "number" ? p : p.number
                  )
                : devbox.ports,
            })) || [],
          database: parsedArgs.resources.database || [],
        }
      : parsedArgs
    : { project_name: "", devbox: [], database: [] };

  const templateName = isTemplateArgs ? parsedArgs?.template_name : "";

  // Initialize hooks (stable order)
  const { deployImage } = useImageDeployment(imageArgs);
  const { deployTemplate } = useTemplateDeployment(templateName);
  const { deployDevenv } = useDevenvDeployment({
    args: devenvArgs,
  });

  // Throttle deployment functions to prevent rapid triggers (max once per 10s)
  // Use refs to track last execution time for manual throttling
  const lastDeployTimeRef = useRef<{
    template: number;
    image: number;
    devenv: number;
  }>({ template: 0, image: 0, devenv: 0 });

  const throttledDeployTemplate = useCallback(
    async (params: {
      templateName: string;
      templateForm?: Record<string, string>;
    }) => {
      const now = Date.now();
      if (now - lastDeployTimeRef.current.template < 10000) {
        return;
      }
      lastDeployTimeRef.current.template = now;
      return deployTemplate(params);
    },
    [deployTemplate]
  );

  const throttledDeployImage = useCallback(async () => {
    const now = Date.now();
    if (now - lastDeployTimeRef.current.image < 10000) {
      return;
    }
    lastDeployTimeRef.current.image = now;
    return deployImage();
  }, [deployImage]);

  const throttledDeployDevenv = useCallback(async () => {
    const now = Date.now();
    if (now - lastDeployTimeRef.current.devenv < 10000) {
      return;
    }
    lastDeployTimeRef.current.devenv = now;
    return deployDevenv();
  }, [deployDevenv]);

  // Trigger deployment once when args are present
  const hasDeployedRef = useRef(false);

  useEffect(() => {
    if (!parsedArgs || hasDeployedRef.current) return;

    const run = async () => {
      try {
        const willDeploy = isTemplateArgs || isImageArgs || isDevenvArgs;
        if (willDeploy) setIsDeploying(true);

        if (isTemplateArgs) {
          // Prefer handleDeploy to respect input requirements
          await throttledDeployTemplate({
            templateName,
            templateForm: parsedArgs.template_form,
          });
        } else if (isImageArgs) {
          // Prefer deployImage to respect input requirements
          await throttledDeployImage();
        } else if (isDevenvArgs) {
          // Prefer deployDevenv to respect input requirements
          await throttledDeployDevenv();
        }
      } catch (err) {
        console.error("[HomePage] Auto-deploy failed:", err);
      } finally {
        setIsDeploying(false);
        hasDeployedRef.current = true;
      }
    };
    run();
  }, [parsedArgs]);

  // Auto-submit query if present (only once)
  useEffect(() => {
    if (query?.trim() && threadId && !hasAutoSubmitted.current) {
      const timeout = setTimeout(() => {
        hasAutoSubmitted.current = true;
        submit(
          {
            messages: [
              { type: "human", content: decodeURIComponent(query || "") },
            ],
          } as any,
          {
            optimisticValues(prev: any) {
              const prevMessages = prev.messages ?? [];
              const newMessages = [
                ...prevMessages,
                { type: "human", content: decodeURIComponent(query || "") },
              ];
              return { ...prev, messages: newMessages };
            },
          }
        );
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [query, threadId, submit]);

  const showMessages = messages.length > 0;
  const hasMessages = messages.length > 0;
  const hasProjects = projects && projects.length > 0;

  // Handler for AI Agent selection
  const handleAIAgentSelect = (selection: string) => {
    const message = `I want to deploy ${selection} from app store.`;
    submit(
      {
        newMessages: [{ type: "human", content: message }],
      } as any,
      {
        optimisticValues(prev: any) {
          const prevMessages = prev.messages ?? [];
          const newMessages = [
            ...prevMessages,
            { type: "human", content: message },
          ];
          return { ...prev, messages: newMessages };
        },
      }
    );
  };

  // Handler for Dev Runtime selection
  const handleDevRuntimeSelect = (selection: string) => {
    const message = `I want to build an app using ${selection} devbox runtime.`;
    submit(
      {
        newMessages: [{ type: "human", content: message }],
      } as any,
      {
        optimisticValues(prev: any) {
          const prevMessages = prev.messages ?? [];
          const newMessages = [
            ...prevMessages,
            { type: "human", content: message },
          ];
          return { ...prev, messages: newMessages };
        },
      }
    );
  };

  // Handler for Database selection
  const handleDatabaseSelect = (selection: string) => {
    const message = `I want to deploy only ${selection}.`;
    submit(
      {
        newMessages: [{ type: "human", content: message }],
      } as any,
      {
        optimisticValues(prev: any) {
          const prevMessages = prev.messages ?? [];
          const newMessages = [
            ...prevMessages,
            { type: "human", content: message },
          ];
          return { ...prev, messages: newMessages };
        },
      }
    );
  };

  // If we have a query but no messages yet, show loading spinner
  if (query?.trim() && !hasMessages) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

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
              heroTitle={
                userName
                  ? `Time to ship anything, ${userName}`
                  : "Time to ship anything"
              }
              subtitle="No YAML. No Dockerfile. No CI/CD. Describe what you need in plain English and deploy to production in seconds—powered by Kubernetes, without the complexity."
              titleClassName="text-5xl font-extrabold"
              subtitleClassName="text-md md:text-lg max-w-[800px]"
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
          <div className="container mx-auto max-w-3xl">
            <div className="relative">
              <AiChatInput
                className={`max-w-3xl${!showMessages ? " min-h-[140px]" : ""}`}
                exhibition={!showMessages}
                onSubmit={submit}
                onStop={stop}
                isLoading={isLoading}
                disableTools={true}
                textareaRef={textareaRef}
              />
              {!showMessages && (
                <div className="absolute bottom-2 left-2 right-2 flex gap-2 pointer-events-none">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-background-tertiary! border-border-primary! pointer-events-auto"
                      >
                        <LayoutTemplate />
                        From Template
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Bot className="mr-2 h-4 w-4" />
                          AI Agent
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent
                          sideOffset={8}
                          alignOffset={-4}
                          className="w-44 rounded-lg"
                        >
                          <DropdownMenuItem
                            onClick={() => handleAIAgentSelect("FastGPT")}
                          >
                            <img
                              src={getQuickShortcutIcon("FastGPT")}
                              alt="FastGPT"
                              className="mr-2 h-4 w-4"
                            />
                            FastGPT
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAIAgentSelect("n8n")}
                          >
                            <img
                              src={getQuickShortcutIcon("N8N")}
                              alt="n8n"
                              className="mr-2 h-4 w-4"
                            />
                            n8n
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAIAgentSelect("Dify")}
                          >
                            <img
                              src={getQuickShortcutIcon("Dify")}
                              alt="Dify"
                              className="mr-2 h-4 w-4"
                            />
                            Dify
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAIAgentSelect("Lobechat")}
                          >
                            <img
                              src={getQuickShortcutIcon("Lobe Chat")}
                              alt="Lobechat"
                              className="mr-2 h-4 w-4"
                            />
                            Lobechat
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Code2 className="mr-2 h-4 w-4" />
                          Dev Runtime
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent
                          sideOffset={8}
                          className="w-44 rounded-lg"
                        >
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Next.js")}
                          >
                            <img
                              src={getQuickShortcutIcon("Next.js")}
                              alt="Next.js"
                              className="mr-2 h-4 w-4"
                            />
                            Next.js
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("React")}
                          >
                            <img
                              src={getQuickShortcutIcon("React")}
                              alt="React"
                              className="mr-2 h-4 w-4"
                            />
                            React
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Astro")}
                          >
                            <img
                              src={getQuickShortcutIcon("Astro")}
                              alt="Astro"
                              className="mr-2 h-4 w-4"
                            />
                            Astro
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Django")}
                          >
                            <img
                              src={getQuickShortcutIcon("Django")}
                              alt="Django"
                              className="mr-2 h-4 w-4"
                            />
                            Django
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Flask")}
                          >
                            <img
                              src={getQuickShortcutIcon("Flask")}
                              alt="Flask"
                              className="mr-2 h-4 w-4"
                            />
                            Flask
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDevRuntimeSelect("Spring Boot")
                            }
                          >
                            <img
                              src={getQuickShortcutIcon("Spring Boot")}
                              alt="Spring Boot"
                              className="mr-2 h-4 w-4"
                            />
                            Spring Boot
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Python")}
                          >
                            <img
                              src={getQuickShortcutIcon("Python")}
                              alt="Python"
                              className="mr-2 h-4 w-4"
                            />
                            Python
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Go")}
                          >
                            <img
                              src={getQuickShortcutIcon("Go")}
                              alt="Go"
                              className="mr-2 h-4 w-4"
                            />
                            Go
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("PHP")}
                          >
                            <img
                              src={getQuickShortcutIcon("PHP")}
                              alt="PHP"
                              className="mr-2 h-4 w-4"
                            />
                            PHP
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Java")}
                          >
                            <img
                              src={getQuickShortcutIcon("Java")}
                              alt="Java"
                              className="mr-2 h-4 w-4"
                            />
                            Java
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDevRuntimeSelect("Rust")}
                          >
                            <img
                              src={getQuickShortcutIcon("Rust")}
                              alt="Rust"
                              className="mr-2 h-4 w-4"
                            />
                            Rust
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Database className="mr-2 h-4 w-4" />
                          Database
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent
                          sideOffset={8}
                          className="w-44 rounded-lg"
                        >
                          {AVAILABLE_CLUSTER_TYPES.map((type) => {
                            // Map cluster type to quick shortcut icon key
                            const iconKeyMap: Record<string, string> = {
                              postgresql: "PostgreSQL",
                              mongodb: "MongoDB",
                              "apecloud-mysql": "MySQL",
                              redis: "Redis",
                              kafka: "Kafka",
                              milvus: "Milvus",
                            };
                            const iconKey = iconKeyMap[type] || type;
                            const displayName =
                              type.charAt(0).toUpperCase() +
                              type.slice(1).replace(/-/g, " ");
                            return (
                              <DropdownMenuItem
                                key={type}
                                onClick={() =>
                                  handleDatabaseSelect(displayName)
                                }
                              >
                                <img
                                  src={getQuickShortcutIcon(iconKey)}
                                  alt={type}
                                  className="mr-2 h-4 w-4"
                                />
                                {displayName}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem onClick={openDialog}>
                        <LayoutGrid className="h-4 w-4" />
                        App Store
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            {/* Quick Shortcuts - below the input box */}
            {/* {!showMessages && (
							<QuickShortcuts textareaRef={textareaRef} />
						)} */}
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

      {isDeploying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Spinner variant="circle" size={20} />
        </div>
      )}
    </div>
  );
}
