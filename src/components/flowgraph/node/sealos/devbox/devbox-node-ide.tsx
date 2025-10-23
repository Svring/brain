"use client";

import { useLocalStorage } from "@reactuses/core";
import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createK8sContext, useDevboxContext } from "@/lib/auth/auth-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
	DEVBOX_IDE,
	DEVBOX_IDE_ICON_MAP,
} from "@/lib/sealos/resources/devbox/devbox-constant-a";
import { getDevboxSshInfo } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { composeSshConnectionUri } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import type { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface DevboxNodeIdeProps {
	object: DevboxObject;
}

export default function DevboxNodeIde({ object }: DevboxNodeIdeProps) {
	const [selectedIde, setSelectedIde] = useLocalStorage<string>(
		"devbox-ide-selection",
		"vscode",
	);
	const context = createK8sContext();
	const devboxContext = useDevboxContext();

	const getIdeIconUrl = (ide: string) => {
		// Check if there's a custom icon mapping for this IDE
		if (DEVBOX_IDE_ICON_MAP[ide]) {
			return DEVBOX_IDE_ICON_MAP[ide];
		}
		// Fall back to the default devbox icon URL
		return `https://devbox.${context.regionUrl}/images/ide/${ide}.svg`;
	};

	const target = CustomResourceTargetSchema.parse(
		convertResourceTypeToTarget("devbox", object.name),
	);

	return (
		<div
			className={`flex items-center border border-border-primary rounded-lg overflow-hidden bg-background-tertiary`}
		>
			{/* IDE Icon and Name - Click to open IDE */}
			<button
				type="button"
				onClick={async (e) => {
					e.stopPropagation();
					toast.info("Opening IDE...");
					try {
						// Fetch SSH info dynamically
						const token = await getDevboxSshInfo(devboxContext, target);

						if (object.ssh) {
							const sshUri = composeSshConnectionUri(
								selectedIde || "vscode",
								context,
								object.ssh,
								object.name,
								token,
							);
							window.location.href = sshUri;
						}
					} catch (error) {
						// console.error("Failed to get SSH info:", error);
						toast.error("Failed to open IDE");
					}
				}}
				className="p-1.5 hover:bg-muted transition-colors flex items-center gap-2"
			>
				<img
					src={getIdeIconUrl(selectedIde || "vscode")}
					alt={`${selectedIde} icon`}
					width={16}
					height={16}
					className="h-5 w-5"
				/>
			</button>

			{/* Separator */}
			<div className="w-px h-4 bg-border" />

			{/* Dropdown Arrow */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						onClick={(e) => {
							e.stopPropagation();
						}}
						className="p-1.5 hover:bg-muted transition-colors flex items-center"
					>
						<ChevronDown className="h-5 w-3" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="rounded-xl bg-background-tertiary border border-border-primary"
				>
					{DEVBOX_IDE.map((ide) => (
						<DropdownMenuItem
							key={ide}
							onClick={async (e) => {
								e.stopPropagation();
								setSelectedIde(ide);
								toast.info("Opening IDE...");

								// Directly trigger connection when IDE is selected
								try {
									const token = await getDevboxSshInfo(devboxContext, target);

									if (object.ssh) {
										const sshUri = composeSshConnectionUri(
											ide,
											context,
											object.ssh,
											object.name,
											token,
										);
										window.location.href = sshUri;
									}
								} catch (error) {
									console.error("Failed to get SSH info:", error);
									toast.error("Failed to open IDE");
								}
							}}
							className={selectedIde === ide ? "bg-muted" : ""}
						>
							<img
								src={getIdeIconUrl(ide)}
								alt={`${ide} icon`}
								width={16}
								height={16}
								className="mr-2 h-4 w-4"
							/>
							<span className="capitalize flex-1">{ide}</span>
							{selectedIde === ide && (
								<Check className="h-4 w-4 ml-2 text-theme-blue" />
							)}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
