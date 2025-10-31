"use client";

import { motion } from "framer-motion";
import { LayoutTemplate, Loader2, Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
import Suggestions from "@/components/chat/components/suggestions";
import RecentProjects from "@/components/project/recent-projects";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/hero";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeployTemplateDialog } from "@/hooks/brain/use-deploy-template-dialog";
import { useLaunchpadCreateDialog } from "@/hooks/brain/use-launchpad-create-dialog";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { useDevenvDeployment } from "@/hooks/langgraph/use-devenv-deployment";
import { useImageDeployment } from "@/hooks/langgraph/use-image-deployment";
import { useTemplateDeployment } from "@/hooks/langgraph/use-template-deployment";

export default function HomePage() {
	const [isDeploying, setIsDeploying] = useState(false);
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
	const [argsParam] = useQueryState("args");
	const [query] = useQueryState("query");
	const hasAutoSubmitted = useRef(false);

	// Parse args from query (JSON string)
	const parsedArgs = useMemo(() => {
		if (!argsParam) return null;
		try {
			return JSON.parse(decodeURIComponent(argsParam));
		} catch {
			return null;
		}
	}, [argsParam]);

	// Determine arg shape
	const isTemplateArgs = useMemo(
		() =>
			Boolean(
				parsedArgs &&
					typeof parsedArgs === "object" &&
					typeof parsedArgs.template_name === "string" &&
					parsedArgs.template_name.length > 0,
			),
		[parsedArgs],
	);
	const isImageArgs = useMemo(
		() =>
			Boolean(
				parsedArgs &&
					typeof parsedArgs === "object" &&
					typeof parsedArgs.image_name === "string" &&
					parsedArgs.image_name.length > 0 &&
					typeof parsedArgs.project_name === "string" &&
					parsedArgs.project_name.length > 0 &&
					typeof parsedArgs.name === "string" &&
					parsedArgs.name.length > 0,
			),
		[parsedArgs],
	);
	const isDevenvArgs = useMemo(
		() =>
			Boolean(
				parsedArgs &&
					typeof parsedArgs === "object" &&
					typeof parsedArgs.project_name === "string" &&
					parsedArgs.project_name.length > 0 &&
					(Array.isArray(parsedArgs.devbox) ||
						Array.isArray(parsedArgs.database)),
			),
		[parsedArgs],
	);

	// Prepare args for hooks with safe defaults
	const imageArgs = isImageArgs
		? parsedArgs
		: { image_name: "", project_name: "", name: "", ports: [] };
	const devenvArgs = isDevenvArgs
		? parsedArgs
		: { project_name: "", devbox: [], database: [] };
	const templateName = isTemplateArgs ? parsedArgs?.template_name : "";

	// Initialize hooks (stable order)
	const { deployImage } = useImageDeployment(imageArgs);
	const { deployTemplate } = useTemplateDeployment(templateName);
	const { deployDevenv } = useDevenvDeployment({
		args: devenvArgs,
	});

	// Trigger deployment once when args are present
	const hasDeployedRef = useRef(false);

	useEffect(() => {
		console.log("parsedArgs", parsedArgs);
		if (!parsedArgs || hasDeployedRef.current) return;

		const run = async () => {
			try {
				const willDeploy = isTemplateArgs || isImageArgs || isDevenvArgs;
				if (willDeploy) setIsDeploying(true);

				if (isTemplateArgs) {
					// Prefer handleDeploy to respect input requirements
					console.log("isTemplateArgs", isTemplateArgs);
					await deployTemplate({
						templateName,
						templateForm: parsedArgs.template_form,
					});
				} else if (isImageArgs) {
					// Prefer deployImage to respect input requirements
					console.log("isImageArgs", isImageArgs);
					await deployImage();
				} else if (isDevenvArgs) {
					// Prefer deployDevenv to respect input requirements
					console.log("isDevenvArgs", isDevenvArgs);
					await deployDevenv();
				}
			} catch (err) {
				console.error("[HomePage] Auto-deploy failed:", err);
			} finally {
				setIsDeploying(false);
				hasDeployedRef.current = true;
			}
		};
		run();
	}, [parsedArgs, isTemplateArgs, isImageArgs]);

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
					},
				);
			}, 1000);

			return () => clearTimeout(timeout);
		}
	}, [query, threadId, submit]);

	const showMessages = messages.length > 0;
	const hasMessages = messages.length > 0;
	const hasProjects = projects && projects.length > 0;

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
							disableTools={true}
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

			{isDeploying && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
					<Spinner variant="circle" size={20} />
				</div>
			)}
		</div>
	);
}
