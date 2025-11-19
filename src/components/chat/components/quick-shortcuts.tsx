"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getQuickShortcutIcon } from "@/lib/quick-shortcuts/quick-shortcuts-icons";
import { Bot, ChevronRight, ChevronsLeftRight, Database } from "lucide-react";
import { useState } from "react";

interface QuickShortcutsProps {
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const shortcuts = [
	{
		label: "Claude Code",
		content: "Give me a cloud dev environment with claude code.",
	},
	{
		label: "Build full-stack application",
		content: "I want to create a full-stack application using Next.js and database.",
	},
	{
		label: "Deploy N8N",
		content: "I need to deploy n8n from an app store with queue mode.",
	},
	{
		label: "Build Django application",
		content: "I want to build a Python Django web application.",
	},
];

const aiAgentOptions = [
	{ label: "N8N", value: "N8N" },
	{ label: "Dify", value: "Dify" },
	{ label: "FastGPT", value: "FastGPT" },
	{ label: "Lobe Chat", value: "Lobe Chat" },
];

const databaseOptions = [
	{ label: "PostgreSQL", value: "PostgreSQL" },
	{ label: "MongoDB", value: "MongoDB" },
	{ label: "MySQL", value: "MySQL" },
	{ label: "Redis", value: "Redis" },
	{ label: "Kafka", value: "Kafka" },
	{ label: "Milvus", value: "Milvus" },
];

const devRuntimeOptions = [
	{ label: "Next.js", value: "Next.js" },
	{ label: "React", value: "React" },
	{ label: "Astro", value: "Astro" },
	{ label: "Django", value: "Django" },
	{ label: "Flask", value: "Flask" },
	{ label: "Spring Boot", value: "Spring Boot" },
	{ label: "Python", value: "Python" },
	{ label: "Go", value: "Go" },
	{ label: "PHP", value: "PHP" },
	{ label: "Java", value: "Java" },
	{ label: "Rust", value: "Rust" },
];

export function QuickShortcuts({ textareaRef }: QuickShortcutsProps) {
	const [openDropdown, setOpenDropdown] = useState<"aiAgent" | "database" | "devRuntime" | null>(null);

	const handleShortcutClick = (content: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		// Set the value using the native setter to bypass React's controlled component
		const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
			window.HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		if (nativeInputValueSetter) {
			nativeInputValueSetter.call(textarea, content);
		} else {
			textarea.value = content;
		}

		// Create and dispatch an input event that React will recognize
		// This will trigger the onChange handler in PromptInputTextarea
		const inputEvent = new Event("input", { bubbles: true, cancelable: true });
		textarea.dispatchEvent(inputEvent);

		// Also trigger change event for compatibility
		const changeEvent = new Event("change", { bubbles: true, cancelable: true });
		textarea.dispatchEvent(changeEvent);

		// Focus the textarea
		textarea.focus();

		// Adjust height to fit content
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	const handleDropdownSelect = (template: string, value: string) => {
		let content = "";
		if (template === "aiAgent") {
			content = `I want to deploy ${value} from app store.`;
		} else if (template === "database") {
			content = `I want to deploy only ${value}.`;
		} else if (template === "devRuntime") {
			content = `I want to build an app using ${value} devbox runtime.`;
		}
		handleShortcutClick(content);
		// Close the dropdown after selection
		setOpenDropdown(null);
	};

	return (
		<div className="mt-0">
			<p className="text-muted-foreground text-sm mb-1 text-left">
				Some ideas to get started:
			</p>
			<div className="flex gap-2 flex-wrap justify-start">
				{shortcuts.map((shortcut, index) => (
					<Button
						key={index}
						onClick={() => handleShortcutClick(shortcut.content)}
						variant="outline"
						className="bg-background-tertiary! border-border-primary! pointer-events-auto rounded-full text-gray-400"
					>
						{shortcut.label}
					</Button>
				))}

				{/* AI Agent Dropdown */}
				<DropdownMenu
					open={openDropdown === "aiAgent"}
					onOpenChange={(open) => setOpenDropdown(open ? "aiAgent" : null)}
				>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="bg-background-tertiary! border-border-primary! pointer-events-auto rounded-full text-gray-400"
						>
							<Bot className="h-4 w-4 mr-0 text-gray-400" />
							AI Agent
							<ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-[200px]">
						{aiAgentOptions.map((option) => (
							<DropdownMenuItem
								key={option.value}
								onClick={() => handleDropdownSelect("aiAgent", option.value)}
							>
								<img
									src={getQuickShortcutIcon(option.value)}
									alt={option.label}
									width={16}
									height={16}
									className="mr-2 h-4 w-4"
								/>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Database Dropdown */}
				<DropdownMenu
					open={openDropdown === "database"}
					onOpenChange={(open) => setOpenDropdown(open ? "database" : null)}
				>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="bg-background-tertiary! border-border-primary! pointer-events-auto rounded-full text-gray-400"
						>
							<Database className="h-4 w-4 mr-0 text-gray-400" />
							Database
							<ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-[200px]">
						{databaseOptions.map((option) => (
							<DropdownMenuItem
								key={option.value}
								onClick={() => handleDropdownSelect("database", option.value)}
							>
								<img
									src={getQuickShortcutIcon(option.value)}
									alt={option.label}
									width={16}
									height={16}
									className="mr-2 h-4 w-4"
								/>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Dev Runtime Dropdown */}
				<DropdownMenu
					open={openDropdown === "devRuntime"}
					onOpenChange={(open) => setOpenDropdown(open ? "devRuntime" : null)}
				>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="bg-background-tertiary! border-border-primary! pointer-events-auto rounded-full text-gray-400"
						>
							<ChevronsLeftRight className="h-4 w-4 mr-0 text-gray-400" />
							Dev Runtime
							<ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-[200px]">
						{devRuntimeOptions.map((option) => (
							<DropdownMenuItem
								key={option.value}
								onClick={() => handleDropdownSelect("devRuntime", option.value)}
							>
								<img
									src={getQuickShortcutIcon(option.value)}
									alt={option.label}
									width={16}
									height={16}
									className="mr-2 h-4 w-4"
								/>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

