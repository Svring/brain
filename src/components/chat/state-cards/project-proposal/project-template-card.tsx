"use client";

import { FileText, Hammer, Package, Rocket } from "lucide-react";
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTemplateObject } from "@/hooks/template/use-template-object";
import { openCostCenterApp, useSealosContext } from "@/lib/auth/auth-utils";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

interface QuotaCheckResult {
	passed: boolean;
	exceededResources: Array<{
		resource: "cpu" | "memory" | "storage" | "ports";
		required: number;
		available: number;
		message: string;
	}>;
}

interface ProjectTemplateCardProps {
	template: TemplateResource;
	onDeploy?: () => void;
	isDeploying?: boolean;
	hasInputs?: boolean;
	hasRequired?: boolean;
}

export function ProjectTemplateCard({
	template,
	onDeploy,
	isDeploying = false,
	hasInputs = false,
	hasRequired = false,
}: ProjectTemplateCardProps) {
	const apiContext = useMemo(() => useSealosContext(), []);
	const { checkResourceQuota } = useResourceQuotaChecker();
	const { template: templateDetails } = useTemplateObject(
		apiContext,
		template.metadata.name,
	);

	// Calculate hasRequired if not provided as prop
	const computedHasRequired = useMemo(() => {
		if (hasRequired !== false) return hasRequired;
		const inputs = template.spec.inputs;
		return Boolean(
			inputs &&
				Object.values(inputs).some((input: any) => input?.required === true),
		);
	}, [hasRequired, template.spec.inputs]);

	// Check if quota requirements are met
	const quotaCheckResult = useMemo(() => {
		// Use templateDetails resource data if available, otherwise assume no requirements
		const resourceData = templateDetails?.data?.resource;
		if (!resourceData) {
			return { passed: true, exceededResources: [] }; // No requirements means no quota check needed
		}

		return checkResourceQuota({
			cpu: resourceData.cpu,
			memory: resourceData.memory,
			storage: resourceData.storage,
			ports: resourceData.nodeport,
		});
	}, [templateDetails, checkResourceQuota]);

	const quotaCheckPassed = quotaCheckResult.passed;
	return (
		<div className="w-full border p-2 rounded-xl">
			{/* Header with icon and text */}
			{/* <div className="flex items-center mb-3">
        <div className="flex text-sm text-muted-foreground">
          <span>Deploy from template: {template.spec.title}</span>
        </div>
      </div> */}

			<div className="group relative border p-2 rounded-xl text-left transition-all bg-background-secondary hover:shadow-md flex flex-col">
				{/* Header with icon, title, and category */}
				<div className="mb-3 flex items-start gap-4">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted p-2">
						{template.spec.icon ? (
							<img
								alt={`${template.spec.title} icon`}
								className="size-6"
								height={24}
								src={template.spec.icon}
								width={24}
							/>
						) : (
							<div className="size-6 rounded bg-gray-300" />
						)}
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between">
							<div className="flex-1 min-w-0">
								<h2 className="font-semibold text-base leading-tight truncate">
									{template.spec.title}
								</h2>
								{/* Category below name */}
								{template.spec.categories &&
									template.spec.categories.length > 0 && (
										<p className="mt-1 text-xs text-muted-foreground">
											{template.spec.categories[0].toLowerCase() === "ai"
												? "AI"
												: template.spec.categories[0].charAt(0).toUpperCase() +
													template.spec.categories[0].slice(1)}
										</p>
									)}
							</div>
						</div>
					</div>
				</div>

				{/* Description aligned to the left */}
				<div className="flex-1">
					<p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
						{template.spec.i18n?.en?.description ||
							template.spec.description ||
							"No description available"}
					</p>
				</div>
			</div>

			<div className="pt-2">
				<Button
					onClick={onDeploy}
					disabled={isDeploying || !quotaCheckPassed}
					className="w-full"
					// variant={"outline"}
				>
					{isDeploying ? (
						<>
							<Spinner variant="circle" size={16} className="mr-2" />
							Deploying...
						</>
					) : (
						<>
							<Rocket className="h-4 w-4 mr-2" />
							{computedHasRequired ? "Configure & Deploy" : "Deploy"}
						</>
					)}
				</Button>
			</div>

			{/* Display exceeded quota information */}
			{!quotaCheckPassed && quotaCheckResult.exceededResources.length > 0 && (
				<div className="pt-2">
					<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
						<div className="flex items-center gap-2 mb-2">
							<p className="text-sm font-medium text-destructive">
								Insufficient Quotas
							</p>
						</div>
						<div className="space-y-1">
							{quotaCheckResult.exceededResources.map((exceeded, index) => (
								<div
									key={index}
									className="flex items-center justify-between text-xs"
								>
									<span className="text-muted-foreground">
										{exceeded.resource.charAt(0).toUpperCase() +
											exceeded.resource.slice(1)}
										:
									</span>
									<span className="font-medium text-destructive">
										requires {exceeded.required.toFixed(2)}{" "}
										{exceeded.resource === "cpu"
											? "cores"
											: exceeded.resource === "memory" ||
													exceeded.resource === "storage"
												? "GB"
												: "ports"}
										,{exceeded.available.toFixed(2)}{" "}
										{exceeded.resource === "cpu"
											? "cores"
											: exceeded.resource === "memory" ||
													exceeded.resource === "storage"
												? "GB"
												: "ports"}{" "}
										available
									</span>
								</div>
							))}
						</div>
						<button
							onClick={openCostCenterApp}
							className="mt-2 w-full py-1.5 bg-foreground text-xs text-background rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
						>
							Open Cost Center
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
