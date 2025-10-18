"use client";

import { ChevronRight, Focus, History, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface HeaderViewProps {
	title?: string;
	// Button handlers
	onNewChat?: () => void;
	onClose?: () => void;
	onFocusToggle?: (pressed: boolean) => void;
	onThreadSelect?: (threadId: string) => void;
	// State
	isCreatingThread?: boolean;
	isMaximized?: boolean;
	showFocusToggle?: boolean;
	threads?: Array<{
		thread_id: string;
		title?: string;
		updated_at?: string;
	}>;
	currentThreadId?: string;
}

export function HeaderView(props: HeaderViewProps) {
	const {
		title = "Chat",
		onNewChat = () => {},
		onClose = () => {},
		onFocusToggle = () => {},
		onThreadSelect = () => {},
		isCreatingThread = false,
		isMaximized = false,
		showFocusToggle = false,
		threads = [],
		currentThreadId,
	} = props;

	return (
		<div className="p-2 shrink-0 bg-transparent">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2 min-w-0 flex-1">
					<h2 className="text-sm font-medium truncate">{title}</h2>
				</div>

				<div className="flex items-center gap-1">
					{/* New Chat Button */}
					<Button
						onClick={onNewChat}
						size="icon"
						variant="ghost"
						className="h-8 w-8 transition-none"
						disabled={isCreatingThread}
					>
						{isCreatingThread ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Plus className="h-4 w-4" />
						)}
					</Button>

					{/* History Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8 transition-none">
								<History className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="max-w-xs">
							{threads.length > 0 ? (
								<div className="max-h-80 overflow-y-auto space-y-1">
									{threads.map((thread) => (
										<DropdownMenuItem
											key={thread.thread_id}
											onClick={() => onThreadSelect(thread.thread_id)}
											className={cn(
												"p-2 cursor-pointer",
												thread.thread_id === currentThreadId &&
													"bg-muted/50 border rounded-md",
											)}
										>
											<div className="flex items-center justify-between w-full gap-2">
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium truncate">
														{thread.title ||
															`Thread ${thread.thread_id.slice(0, 8)}`}
													</div>
													{thread.updated_at && (
														<div className="text-xs text-muted-foreground">
															{new Date(
																thread.updated_at,
															).toLocaleDateString()}
														</div>
													)}
												</div>
											</div>
										</DropdownMenuItem>
									))}
								</div>
							) : (
								<div className="p-2 text-sm text-muted-foreground">
									No chat history
								</div>
							)}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Focus Toggle */}
					{showFocusToggle && (
						<Toggle
							pressed={isMaximized}
							onPressedChange={onFocusToggle}
							size="sm"
							className={cn(
								"h-8 w-8 hover:text-theme-blue transition-none",
								isMaximized && "text-theme-blue",
							)}
						>
							<Focus className="h-4 w-4" />
						</Toggle>
					)}

					{/* Close Button */}
					<Button
						onClick={onClose}
						size="icon"
						variant="ghost"
						className="h-8 w-8 transition-none"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
