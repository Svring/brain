"use client";

import type { Message, Thread } from "@langchain/langgraph-sdk";
import { History, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useChatInstance } from "@/components/provider/chat-instance-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useProjectState } from "@/contexts/project/project-context";
import { cn } from "@/lib/utils";
import { DeleteThreadDialog } from "./delete-thread-dialog";

export function HistoryDropdown() {
	const {
		resourceTarget,
		threadId,
		threads,
		setChatThreadId,
		setChatThreads,
		isLoading,
	} = useChatInstance();
	const { deleteThread, getThreads } = useThreads();
	const { closeChat, openChat, closeProjectChat, openProjectChat } =
		useChatActions();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
	const { selectedProject, selectedResource } = useProjectState();

	// Function to refetch and update threads
	const refetchAndUpdateThreads = async () => {
		try {
			const updatedThreads = await getThreads(resourceTarget);
			setChatThreads(updatedThreads);
		} catch (error) {
			console.error("HistoryDropdown - Failed to refetch threads:", error);
		}
	};

	// Refetch threads when selectedProject or selectedResource changes
	useEffect(() => {
		refetchAndUpdateThreads();
	}, [selectedProject, selectedResource, isLoading]);

	// Filter and limit threads based on resourceTarget
	const filteredAndLimitedThreads = useMemo(() => {
		if (!threads || threads.length === 0) return [];

		// Sort by updated_at (most recent first) and limit to 10
		return threads
			.sort((a, b) => {
				const dateA = new Date(a.updated_at || 0).getTime();
				const dateB = new Date(b.updated_at || 0).getTime();
				return dateB - dateA;
			})
			.slice(0, 10);
	}, [threads, threadId, isLoading]);

	const handleThreadSelect = async (threadId: string): Promise<void> => {
		// Set the selected thread ID in the chat instance
		setChatThreadId(threadId);
	};

	const handleDeleteThread = (threadId: string, event: React.MouseEvent) => {
		event.stopPropagation(); // Prevent thread selection when clicking delete
		setThreadToDelete(threadId);
		setDeleteDialogOpen(true);
		setDropdownOpen(false); // Close the dropdown menu
	};

	const formatThreadDate = (updatedAt: string): string => {
		const date = new Date(updatedAt);
		const now = new Date();
		const diffInHours = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60),
		);

		if (diffInHours < 1) {
			return "Just now";
		} else if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		} else {
			const diffInDays = Math.floor(diffInHours / 24);
			if (diffInDays < 7) {
				return `${diffInDays}d ago`;
			} else {
				return date.toLocaleDateString();
			}
		}
	};

	const getThreadTitle = (thread: Thread): string => {
		try {
			// Find the first message from either human or ai
			const firstMessage = (thread.values as any)?.messages?.find(
				(msg: Message) => msg.type === "human" || msg.type === "ai",
			);

			if (firstMessage?.content) {
				// Truncate the content to a reasonable length for display
				const content = String(firstMessage.content);
				return content.length > 50 ? content.substring(0, 50) + "..." : content;
			}
		} catch (error) {
			console.warn("Failed to get thread title:", error);
		}

		// Display "New Thread" if no message found or conversion fails
		return "New Thread";
	};

	return (
		<>
			<DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<History className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent>History</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="end" className="max-w-xs">
					{filteredAndLimitedThreads?.length ? (
						<div className="max-h-80 overflow-y-auto space-y-1">
							{filteredAndLimitedThreads.map((thread) => {
								return (
									<DropdownMenuItem
										key={thread.thread_id}
										onClick={() => handleThreadSelect(thread.thread_id)}
										className={cn(
											"p-2 cursor-pointer",
											thread.thread_id === threadId &&
												"bg-muted/50 border rounded-md",
										)}
									>
										<div className="flex items-center justify-between w-full gap-2">
											<div className="flex items-center gap-2 flex-1 min-w-0">
												<div className="text-sm font-medium truncate flex-1 min-w-0">
													{getThreadTitle(thread)}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<div className="text-xs text-muted-foreground shrink-0 max-w-[60px]">
													{thread.updated_at
														? formatThreadDate(thread.updated_at)
														: "Unknown"}
												</div>
												<Button
													size="icon"
													variant="ghost"
													className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
													onClick={(e) =>
														handleDeleteThread(thread.thread_id, e)
													}
													disabled={deleteThread.isPending}
												>
													{deleteThread.isPending ? (
														<Spinner variant="ellipsis" size={12} />
													) : (
														<Trash2 className="h-3 w-3" />
													)}
												</Button>
											</div>
										</div>
									</DropdownMenuItem>
								);
							})}
						</div>
					) : (
						<div className="p-2 text-sm text-muted-foreground text-center">
							{resourceTarget
								? `No chat history for ${resourceTarget.name}`
								: "No general chat history available"}
						</div>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteThreadDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				threadToDelete={threadToDelete}
				onConfirm={() => {
					if (threadToDelete) {
						const isCurrentThread = threadToDelete === threadId;

						deleteThread.mutate(threadToDelete, {
							onSuccess: () => {
								// Refetch and update threads after successful deletion
								refetchAndUpdateThreads();

								// If the current thread was deleted, close and reopen the chat
								if (isCurrentThread) {
									if (resourceTarget) {
										// For resource chat, close and reopen
										closeChat(resourceTarget);
										// Use setTimeout to ensure the close operation completes before reopening
										setTimeout(() => {
											openChat(resourceTarget);
										}, 100);
									} else if (selectedProject) {
										// For project chat, close and reopen
										closeProjectChat(selectedProject);
										setTimeout(() => {
											openProjectChat(selectedProject);
										}, 100);
									}
								}
							},
							onError: (error: any) => {
								console.error("Failed to delete thread:", error);
							},
						});
						setDeleteDialogOpen(false);
						setThreadToDelete(null);
					}
				}}
				onCancel={() => {
					setDeleteDialogOpen(false);
					setThreadToDelete(null);
				}}
			/>
		</>
	);
}
