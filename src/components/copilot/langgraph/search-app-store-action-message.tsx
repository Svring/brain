"use client";

import {
	ChevronDown,
	ChevronRight,
	ChevronUp,
	CircleCheckBigIcon,
	ExternalLink,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { useTemplates } from "@/hooks/template/use-templates";
import { useTemplateApiContext } from "@/lib/auth/auth-utils";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";

interface AppStoreItem {
	name: string;
	gitRepo: string;
	description: string;
	inputs: Record<
		string,
		{
			description: string;
			type: string;
			default: string;
			required: boolean;
		}
	> | null;
	similarity_score: number;
}

interface AppStoreSearchResult {
	query_keywords: string[];
	total_templates: number;
	relevant_templates: AppStoreItem[];
}

interface SearchAppStoreActionMessageProps {
	result?: AppStoreSearchResult;
}

// Template card component styled like the original template card
const TemplateCard: React.FC<{
	template: TemplateResource;
	hideExternalLink?: boolean;
}> = ({ template, hideExternalLink = false }) => {
	const handleViewRepo = () => {
		if (template.spec.gitRepo) {
			window.open(template.spec.gitRepo, "_blank");
		}
	};

	return (
		<div className="group relative rounded-xl border border-border/50 p-4 text-left transition-all bg-background-secondary hover:shadow-md flex flex-col">
			{/* Header with icon, title, and external link */}
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
						{!hideExternalLink && (
							<div className="flex items-center gap-1 ml-1">
								<Button
									variant="ghost"
									size="sm"
									className="h-5 w-5 p-0"
									onClick={handleViewRepo}
								>
									<ExternalLink className="w-3 h-3" />
								</Button>
							</div>
						)}
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
	);
};

// Component for /home route using useHomeChat
const HomeSearchAppStoreComponent: React.FC<{
	result?: AppStoreSearchResult;
}> = ({ result }) => {
	const { sessionId } = useHomeChat();
	const [showAll, setShowAll] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Get template API context and templates
	const templateApiContext = useTemplateApiContext();
	const { templates, isLoading, error } = useTemplates(templateApiContext);

	// console.log("result", result);

	// Get full templates for the passed in app names
	const foundTemplates = useMemo(() => {
		if (
			!result ||
			!result.relevant_templates ||
			result.relevant_templates.length === 0
		)
			return [];

		// Function to search for template by name
		const searchTemplate = (name: string): TemplateResource | undefined => {
			return templates.find(
				(template) =>
					template.spec.title.toLowerCase() === name.toLowerCase() ||
					template.metadata.name.toLowerCase() === name.toLowerCase(),
			);
		};

		return result.relevant_templates
			.map((item) => searchTemplate(item.name))
			.filter(
				(template): template is TemplateResource => template !== undefined,
			);
	}, [result, templates]);

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="border rounded-lg bg-background-secondary">
					<div className="flex items-center justify-between p-2">
						<div className="flex items-center gap-2">
							<span className="flex items-center">
								<ChevronRight className="h-3 w-3 text-muted-foreground" />
							</span>
							<p className="text-sm text-foreground flex items-center m-0">
								<span className="text-muted-foreground">Action:</span>{" "}
								<span className="text-foreground ml-1">Search App Store</span>
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Spinner
								variant="circle"
								className="h-4 w-4 text-muted-foreground"
							/>
							<span className="text-sm text-muted-foreground">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full">
				<div className="border rounded-lg bg-background-secondary">
					<div className="flex items-center justify-between p-2">
						<div className="flex items-center gap-2">
							<span className="flex items-center">
								<ChevronRight className="h-3 w-3 text-muted-foreground" />
							</span>
							<p className="text-sm text-foreground flex items-center m-0">
								<span className="text-muted-foreground">Action:</span>{" "}
								<span className="text-foreground ml-1">Search App Store</span>
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-red-600">
								Error: {error.message}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (
		!result ||
		!result.relevant_templates ||
		result.relevant_templates.length === 0
	) {
		return null;
	}

	const hasMoreThanThree = foundTemplates.length > 3;
	const displayTemplates = showAll
		? foundTemplates
		: foundTemplates.slice(0, 3);

	// console.log("displayTemplates", displayTemplates);

	return (
		<div className="w-full">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="border rounded-lg bg-background-secondary">
					<CollapsibleTrigger asChild>
						<div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
							<div className="flex items-center gap-2">
								<span className="flex items-center">
									<ChevronRight
										className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
											isOpen ? "rotate-90" : "rotate-0"
										}`}
									/>
								</span>
								<p className="text-sm text-foreground flex items-center m-0">
									<span className="text-muted-foreground">Action:</span>{" "}
									<span className="text-foreground ml-1">Search App Store</span>
								</p>
							</div>
							<div className="flex items-center gap-2">
								<CircleCheckBigIcon className="h-4 w-4 text-theme-green" />
								<span className="text-sm text-theme-green">Completed</span>
							</div>
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent className="border-t border-muted/20">
						<div className="p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex text-sm text-muted-foreground">
									<span>
										Browsed through {result.total_templates} templates and found{" "}
										{foundTemplates.length} relevant results
									</span>
								</div>
								{hasMoreThanThree && (
									<Button
										variant="ghost"
										size="sm"
										className="h-6 text-xs text-muted-foreground hover:text-foreground"
										onClick={() => setShowAll(!showAll)}
									>
										{showAll ? (
											<>
												<ChevronUp className="w-3 h-3 mr-1" />
												Show Less
											</>
										) : (
											<>
												<ChevronDown className="w-3 h-3 mr-1" />
												Show More
											</>
										)}
									</Button>
								)}
							</div>

							<div className="grid grid-cols-3 gap-3">
								{displayTemplates.map((template, index) => (
									<TemplateCard
										key={`${template.metadata.name}-${index}`}
										template={template}
										hideExternalLink={!!sessionId}
									/>
								))}
							</div>
						</div>
					</CollapsibleContent>
				</div>
			</Collapsible>
		</div>
	);
};

// Component for other routes (not /home)
const SearchAppStoreComponent: React.FC<{
	result?: AppStoreSearchResult;
}> = ({ result }) => {
	const [showAll, setShowAll] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Get template API context and templates
	const templateApiContext = useTemplateApiContext();
	const { templates, isLoading, error } = useTemplates(templateApiContext);

	// Get full templates for the passed in app names
	const foundTemplates = useMemo(() => {
		if (
			!result ||
			!result.relevant_templates ||
			result.relevant_templates.length === 0
		)
			return [];

		// Function to search for template by name
		const searchTemplate = (name: string): TemplateResource | undefined => {
			return templates.find(
				(template) =>
					template.spec.title.toLowerCase() === name.toLowerCase() ||
					template.metadata.name.toLowerCase() === name.toLowerCase(),
			);
		};

		return result.relevant_templates
			.map((item) => searchTemplate(item.name))
			.filter(
				(template): template is TemplateResource => template !== undefined,
			);
	}, [result, templates]);

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="border rounded-lg bg-background-secondary">
					<div className="flex items-center justify-between p-2">
						<div className="flex items-center gap-2">
							<span className="flex items-center">
								<ChevronRight className="h-3 w-3 text-muted-foreground" />
							</span>
							<p className="text-sm text-foreground flex items-center m-0">
								<span className="text-muted-foreground">Action:</span>{" "}
								<span className="text-foreground ml-1">Search App Store</span>
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Spinner
								variant="circle"
								className="h-4 w-4 text-muted-foreground"
							/>
							<span className="text-sm text-muted-foreground">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full">
				<div className="border rounded-lg bg-background-secondary">
					<div className="flex items-center justify-between p-2">
						<div className="flex items-center gap-2">
							<span className="flex items-center">
								<ChevronRight className="h-3 w-3 text-muted-foreground" />
							</span>
							<p className="text-sm text-foreground flex items-center m-0">
								<span className="text-muted-foreground">Action:</span>{" "}
								<span className="text-foreground ml-1">Search App Store</span>
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-red-600">
								Error: {error.message}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (
		!result ||
		!result.relevant_templates ||
		result.relevant_templates.length === 0
	) {
		return null;
	}

	const hasMoreThanThree = foundTemplates.length > 3;
	const displayTemplates = showAll
		? foundTemplates
		: foundTemplates.slice(0, 3);

	return (
		<div className="w-full">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="border rounded-lg bg-background-secondary">
					<CollapsibleTrigger asChild>
						<div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
							<div className="flex items-center gap-2">
								<span className="flex items-center">
									<ChevronRight
										className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
											isOpen ? "rotate-90" : "rotate-0"
										}`}
									/>
								</span>
								<p className="text-sm text-foreground flex items-center m-0">
									<span className="text-muted-foreground">Action:</span>{" "}
									<span className="text-foreground ml-1">Search App Store</span>
								</p>
							</div>
							<div className="flex items-center gap-2">
								<CircleCheckBigIcon className="h-4 w-4 text-theme-green" />
								<span className="text-sm text-theme-green">Completed</span>
							</div>
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent className="border-t border-muted/20">
						<div className="p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex text-sm text-muted-foreground">
									<span>
										Browsed through {result.total_templates} templates and found{" "}
										{foundTemplates.length} relevant results
									</span>
								</div>
								{hasMoreThanThree && (
									<Button
										variant="ghost"
										size="sm"
										className="h-6 text-xs text-muted-foreground hover:text-foreground"
										onClick={() => setShowAll(!showAll)}
									>
										{showAll ? (
											<>
												<ChevronUp className="w-3 h-3 mr-1" />
												Show Less
											</>
										) : (
											<>
												<ChevronDown className="w-3 h-3 mr-1" />
												Show More
											</>
										)}
									</Button>
								)}
							</div>

							<div className="grid grid-cols-3 gap-3">
								{displayTemplates.map((template, index) => (
									<TemplateCard
										key={`${template.metadata.name}-${index}`}
										template={template}
										hideExternalLink={false}
									/>
								))}
							</div>
						</div>
					</CollapsibleContent>
				</div>
			</Collapsible>
		</div>
	);
};

export const SearchAppStoreActionMessage: React.FC<
	SearchAppStoreActionMessageProps
> = ({ result }) => {
	const pathname = usePathname();

	// Render different components based on route
	if (pathname === "/trial") {
		return <HomeSearchAppStoreComponent result={result} />;
	}

	return <SearchAppStoreComponent result={result} />;
};
