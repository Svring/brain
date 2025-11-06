"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDevboxLifecycle } from "@/hooks/sealos/devbox/use-devbox-lifecycle";
import type { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface DevboxIconButtonsProps {
	object: DevboxObject;
}

export default function DevboxIconButtons({ object }: DevboxIconButtonsProps) {
	const { name: devboxName, status } = object;
	const { executeAction, isPending } = useDevboxLifecycle();

	return (
		<>
			<TooltipProvider>
				<div className="flex items-center gap-1">
					{/* Start Button - Only show when not running */}
					{status !== "Running" && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => executeAction("start", devboxName)}
									disabled={status === "Pending" || isPending("start")}
									className={`h-8 w-8 p-0 ${
										status === "Pending" ? "opacity-50" : ""
									}`}
								>
									<Play className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>Start</p>
							</TooltipContent>
						</Tooltip>
					)}

					{/* Pause Button - Only show when not stopped or shutdown */}
					{status !== "Stopped" && status !== "Shutdown" && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => executeAction("pause", devboxName)}
									disabled={status === "Pending" || isPending("pause")}
									className={`h-8 w-8 p-0 ${
										status === "Pending" ? "opacity-50" : ""
									}`}
								>
									<Pause className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>Pause</p>
							</TooltipContent>
						</Tooltip>
					)}

					{/* Restart Button - Always show */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => executeAction("restart", devboxName)}
								disabled={status === "Pending" || isPending("restart")}
								className={`h-8 w-8 p-0 ${
									status === "Pending" ? "opacity-50" : ""
								}`}
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Restart</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</TooltipProvider>
		</>
	);
}
