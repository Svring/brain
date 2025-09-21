import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import type React from "react";
import Login from "@/components/auth/login";
import QueryProvider from "@/components/provider/query-provider";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/contexts/chat/chat-context";
import { ProjectProvider } from "@/contexts/project/project-context";
import { LanggraphConfigWrapper } from "@/components/provider/langgraph-provider";
import { OrchestratorProvider } from "@/contexts/orchestrator/orchestrator-context";
import { FlowgraphProvider } from "@/contexts/flowgraph/flowgraph-context";
import { ReactFlowProvider } from "@xyflow/react";
import { ReactScan } from "@/components/provider/react-scan-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth/auth-context";
import { getUser } from "@/payload/operations/users-operation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { EnvProvider } from "@/components/provider/env-provider";
import { HomeChatProvider } from "@/components/provider/home-chat-provider";

import "@/styles/globals.css";
import {
  CircleCheckBigIcon,
  InfoIcon,
  TriangleAlertIcon,
  Loader,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sealos Brain",
  description: "Sealos Brain",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read environment variables on the server side
  const env = {
    MODE: process.env.MODE || "production",
    LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY || "",
    LANGGRAPH_DEPLOYMENT_URL: process.env.LANGGRAPH_DEPLOYMENT_URL || "",
    LANGGRAPH_GRAPH_ID: process.env.LANGGRAPH_GRAPH_ID || "",
    AGENT_BASE_URL: process.env.AGENT_BASE_URL || "",
    AGENT_API_KEY: process.env.AGENT_API_KEY || "",
    AGENT_MODEL_NAME: process.env.AGENT_MODEL_NAME || "",
  };

  const isDevelopment = env.MODE === "development";
  const payloadUser = isDevelopment ? await getUser() : null;

  if (isDevelopment && !payloadUser) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            enableSystem
          >
            <Login />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isDevelopment && (
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        )}
      </head>
      {isDevelopment && <ReactScan />}
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <NuqsAdapter>
            <EnvProvider env={env}>
              <AuthProvider payloadUser={payloadUser}>
                <QueryProvider>
                  <ChatProvider>
                    <ProjectProvider>
                      <LanggraphConfigWrapper>
                        <ReactFlowProvider>
                          <FlowgraphProvider>
                            <OrchestratorProvider>
                              <SidebarProvider defaultOpen={false}>
                                <AppSidebar />
                                {children}
                              </SidebarProvider>
                            </OrchestratorProvider>
                          </FlowgraphProvider>
                        </ReactFlowProvider>
                      </LanggraphConfigWrapper>
                    </ProjectProvider>
                  </ChatProvider>
                </QueryProvider>
              </AuthProvider>
            </EnvProvider>
          </NuqsAdapter>
          <Toaster
            position="top-center"
            icons={{
              success: (
                <CircleCheckBigIcon size={20} className="text-theme-green" />
              ),
              info: <InfoIcon size={20} className="text-theme-blue" />,
              warning: (
                <TriangleAlertIcon size={20} className="text-theme-yellow" />
              ),
              error: <TriangleAlertIcon size={20} className="text-theme-red" />,
              loading: <Loader size={20} />,
            }}
            toastOptions={{
              duration: 3000,
              className: "bg-background-tertiary! border-border-primary! p-3!",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
