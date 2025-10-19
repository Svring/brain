"use client";

import type React from "react";
import { HomeChatProvider } from "@/components/provider/home-chat-provider";
import { CopilotTrialAdapter } from "@/contexts/copilot/copilot-trial.adapter";

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<CopilotTrialAdapter>
			<HomeChatProvider>{children}</HomeChatProvider>
		</CopilotTrialAdapter>
	);
}
