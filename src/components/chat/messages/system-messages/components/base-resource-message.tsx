"use client";

import { X } from "lucide-react";
import type React from "react";
import { createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { cn } from "@/lib/utils";
import MessageHeader from "./base-resourec-message-header";

// Context for passing onClose callback
export const ResourceCardCloseContext = createContext<(() => void) | undefined>(
	undefined,
);

export const useResourceCardClose = () => useContext(ResourceCardCloseContext);

export interface MessageAction {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	onClick: () => void;
	disabled?: boolean;
}

export interface BaseResourceMessageProps {
	target?: CustomResourceTarget | BuiltinResourceTarget;
	actions?: MessageAction[];
	showHeader?: boolean;
	headerSlot?: React.ReactNode;
	children?: React.ReactNode;
	prompt?: string;
	onClose?: () => void;
}

export function BaseResourceMessage({
	target,
	actions = [],
	showHeader = true,
	headerSlot,
	children,
	prompt,
	onClose,
}: BaseResourceMessageProps) {
	// Use context if onClose is not provided directly
	const contextOnClose = useResourceCardClose();
	const handleClose = onClose || contextOnClose;

	return (
		<div className="flex justify-start w-full p-2 gap-2">
			<Card className="relative w-full bg-background-secondary border p-2 gap-2">
				{/* Close Button */}
				{handleClose && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleClose();
						}}
						className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-full bg-transparent flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-muted/50 focus:outline-hidden disabled:pointer-events-none shadow-sm z-50 cursor-pointer transition-colors"
						aria-label="Close resource card"
					>
						<X className="h-4 w-4 text-white" />
						<span className="sr-only">Close</span>
					</button>
				)}

				{/* Header Section */}
				{showHeader && target && (
					<MessageHeader target={target} headerSlot={headerSlot} />
				)}

				{/* Content Section */}
				<CardContent className="p-0">{children}</CardContent>

				{/* Actions Section */}
				{actions.length > 0 && (
					<div className="p-0 space-y-3">
						{/* Actions Title */}
						<div className="relative flex items-center">
							<Separator className="flex-1" />
							<h3 className="text-sm font-medium text-foreground px-4">
								Actions
							</h3>
							<Separator className="flex-1" />
						</div>

						{/* Prompt */}
						{prompt && <div className="font-medium">{prompt}</div>}

						{/* Action Buttons */}
						<div className="space-y-2">
							{actions.map((action, index) => (
								<Button
									key={`${action.label}-${index}`}
									variant="outline"
									size="sm"
									onClick={action.onClick}
									disabled={action.disabled}
									className="w-full flex items-center gap-2"
								>
									<action.icon className="h-4 w-4" />
									{action.label}
								</Button>
							))}
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}

export default BaseResourceMessage;
