"use client";

import { useQueryState } from "nuqs";
import type React from "react";
import { HomeChatProvider } from "@/components/provider/home-chat-provider";
import { CopilotTrialAdapter } from "@/contexts/copilot/copilot-trial.adapter";

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const [sessionId] = useQueryState("sessionId");
	const [query] = useQueryState("query");

	console.log("sessionId", sessionId);
	console.log("query", query);
	// If no sessionId is provided, render nothing
	if (!sessionId) return null;

	return (
		<CopilotTrialAdapter sessionId={sessionId} query={query}>
			<HomeChatProvider sessionId={sessionId}>{children}</HomeChatProvider>
		</CopilotTrialAdapter>
	);
}
