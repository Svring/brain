"use client";

import {
	ChevronRight as ChevronRightIcon,
	MousePointerClick,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SystemMessageType } from "@/components/chat/messages/system-messages/systemp-message-types";
import { useChatInstance } from "@/components/provider/chat-instance-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useNavigationState } from "@/contexts/navigation/navigation-context";
import { useProjectState } from "@/contexts/project/project-context";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { cn } from "@/lib/utils";
import { HeaderActions } from "./header/header-actions";

interface AiChatHeaderProps {
	title?: string;
	showResourceDetails?: boolean;
}

export function AiChatHeader({
	title = "Chat",
	showResourceDetails = false,
}: AiChatHeaderProps) {
	const { selectedResource, selectedProject } = useProjectState();
	const { stage } = useLanggraphState();
	const {
		currentPage,
		selectedResource: navSelectedResource,
		activeView,
	} = useNavigationState();
	const { isLoading, resourceTarget } = useChatInstance();
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		if (showResourceDetails && selectedResource) {
			setIsExpanded(true);
		}
	}, [showResourceDetails, selectedResource]);

	useEffect(() => {
		if (isLoading) {
			setIsExpanded(false);
		}
	}, [isLoading]);

	const getIconUrl = () =>
		selectedResource
			? getResourceDefaultIcon(selectedResource.resourceType) ||
				"https://sealos.run/logo.svg"
			: "/sealos-brain-icon-grayscale.svg";

	const renderDetailCard = () => {
		if (!selectedResource) return null;

		const resourceType = selectedResource.resourceType?.toLowerCase() || "";

		let DetailComponent = null;

		switch (resourceType) {
			case "devbox":
				DetailComponent = SystemMessageType.devbox.detail(
					selectedResource as any,
					activeView as any,
				);
				break;
			case "cluster":
				DetailComponent = SystemMessageType.cluster.detail(
					selectedResource as any,
					activeView as any,
				);
				break;
			case "deployment":
				DetailComponent = SystemMessageType.launchpad.detail(
					selectedResource as any,
					activeView as any,
				);
				break;
			case "statefulset":
				DetailComponent = SystemMessageType.launchpad.detail(
					selectedResource as any,
					activeView as any,
				);
				break;
			case "objectstoragebucket":
				DetailComponent = SystemMessageType.objectstorage.detail(
					selectedResource as any,
				);
				break;
			default:
				return null;
		}

		return (
			<div className="max-h-[500px] overflow-y-auto">{DetailComponent}</div>
		);
	};

	const handleToggleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsExpanded(!isExpanded);
	};

	return (
		<div className="px-4 pt-2 shrink-0 bg-transparent">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2 min-w-0 flex-1">
					<h2 className="font-semibold text-foreground text-lg shrink-0">
						{title}
					</h2>

					<Separator
						orientation="vertical"
						className="h-4 w-px bg-border-primary shrink-0"
					/>

					{(selectedResource || selectedProject) && (
						<div className="flex items-center min-w-0 flex-1">
							{showResourceDetails && selectedResource && resourceTarget ? (
								<Popover open={isExpanded} onOpenChange={setIsExpanded}>
									<PopoverTrigger asChild>
										<div
											className={cn(
												"flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-muted/50 transition-colors select-none min-w-0 flex-1 border",
											)}
											onClick={handleToggleClick}
										>
											<div className="flex items-center shrink-0">
												<ChevronRightIcon
													className={cn(
														"h-3 w-3 text-muted-foreground transition-transform duration-200 ease-in-out",
														isExpanded ? "rotate-90" : "rotate-0",
													)}
												/>
											</div>
											<img
												src={getIconUrl()}
												alt={selectedResource?.resourceType || "Sealos Brain"}
												width={16}
												height={16}
												className="rounded-sm shrink-0"
											/>
											<span className="text-muted-foreground truncate min-w-0 text-sm">
												{selectedResource?.name}
											</span>
											<div className="flex items-center gap-1 ml-auto shrink-0">
												<MousePointerClick className="h-4 w-4 text-theme-blue" />
												<span className="text-sm text-theme-blue">details</span>
											</div>
										</div>
									</PopoverTrigger>
									<PopoverContent
										className="p-0 rounded-2xl w-[26rem]"
										align="end"
										side="left"
										sideOffset={80}
										alignOffset={-255}
										avoidCollisions={false}
										onClick={(e) => e.stopPropagation()}
										onMouseDown={(e) => e.stopPropagation()}
									>
										{renderDetailCard()}
									</PopoverContent>
								</Popover>
							) : (
								<div className="flex items-center gap-2 py-1.5 min-w-0 flex-1">
									<span className="text-sm text-muted-foreground truncate min-w-0">
										{selectedProject ||
											(selectedResource && selectedResource.name)}
									</span>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="shrink-0">
					<HeaderActions />
				</div>
			</div>
		</div>
	);
}
