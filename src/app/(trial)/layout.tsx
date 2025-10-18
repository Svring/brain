import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";
import { EnvProvider as EnvProviderComponent } from "@/components/provider/env-provider";
import { LanggraphConfigWrapper } from "@/components/provider/langgraph-provider";
import QueryProvider from "@/components/provider/query-provider";
import { AuthProvider } from "@/contexts/auth/auth-context";
import { ChatProvider } from "@/contexts/chat/chat-context";
import { EnvProvider } from "@/contexts/env/env.provider";
import { ProjectProvider } from "@/contexts/project/project-context";

import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Sealos Brain",
	description: "Sealos Brain",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const env = {
		MODE: process.env.MODE || "production",
		LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY || "",
		LANGGRAPH_DEPLOYMENT_URL: process.env.LANGGRAPH_DEPLOYMENT_URL || "",
		LANGGRAPH_GRAPH_ID: process.env.LANGGRAPH_GRAPH_ID || "",
		AGENT_BASE_URL: process.env.AGENT_BASE_URL || "",
		AGENT_API_KEY: process.env.AGENT_API_KEY || "",
		AGENT_MODEL_NAME: process.env.AGENT_MODEL_NAME || "",
	};
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<NuqsAdapter>
						<EnvProvider>
							<EnvProviderComponent env={env}>
								<AuthProvider payloadUser={null} trial={true}>
									<QueryProvider>
										<ChatProvider>
											<ProjectProvider>
												<LanggraphConfigWrapper trial={true}>
													<main className="h-screen w-full">{children}</main>
												</LanggraphConfigWrapper>
											</ProjectProvider>
										</ChatProvider>
									</QueryProvider>
								</AuthProvider>
							</EnvProviderComponent>
						</EnvProvider>
					</NuqsAdapter>
				</ThemeProvider>
			</body>
		</html>
	);
}
