"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export default function AiChatboxLoading() {
	return (
		<div
			className={cn(
				"h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100 translate-x-0 opacity-100",
			)}
		>
			{/* Simplified header for loading state - no actions to avoid useChatInstance dependency */}
			<div className="px-4 pt-2 shrink-0">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-foreground text-lg">Chat</h2>
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
				{/* Loading state indicator */}
				<div className="flex items-center justify-center h-full">
					<div className="flex flex-col items-center gap-3 text-muted-foreground">
						<Spinner variant="circle" size={20} />
					</div>
				</div>
			</div>
		</div>
	);
}
