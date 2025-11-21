"use client";

import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { HomeChatProvider } from "@/components/provider/home-chat-provider";

interface ChatLayoutProps {
	children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
	const [trial] = useQueryState("trial");
	return <HomeChatProvider trial={trial}>{children}</HomeChatProvider>;
}
