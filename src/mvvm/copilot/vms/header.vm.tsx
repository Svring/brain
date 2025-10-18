"use client";

import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";
import { useCopilotEvents } from "@/contexts/copilot/copilot.context";
import { useProjectState } from "@/contexts/project/project.context";
import { HeaderView } from "../views/header.view";

export const Header = () => {

	const { close } = useCopilotEvents();
	const { project, activeResource } = useProjectState();
	const { metadata, threads, threadId } = useCopilotAdapterContext();

	// Determine title based on metadata and active resource
	const getTitle = () => {
		console.log("Metadata:", metadata);
		// If metadata contains resourceId, use the active resource's target name
		if (metadata?.resourceUid && activeResource) {
			return activeResource.target.name;
		}

		// Otherwise, use project displayName
		return project?.displayName || "Chat";
	};

	const title = getTitle();

	// Empty function implementations
	const handleNewChat = () => {
		console.log("New chat clicked");
	};

	const handleClose = () => {
		close();
	};

	const handleFocusToggle = (pressed: boolean) => {
		console.log("Focus toggle:", pressed);
	};

	const handleThreadSelect = (threadId: string) => {
		console.log("Thread selected:", threadId);
	};

	return (
		<HeaderView
			title={title}
			onNewChat={handleNewChat}
			onClose={handleClose}
			onFocusToggle={handleFocusToggle}
			onThreadSelect={handleThreadSelect}
			threads={threads}
			currentThreadId={threadId}
		/>
	);
};
