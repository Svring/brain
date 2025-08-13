import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type React from "react";
import Login from "@/components/auth/login";
// import { CopilotProvider } from "@/components/provider/copilot-provider";
import QueryProvider from "@/components/provider/query-provider";
import AppSidebar from "@/components/sidebar/app-sidebar";
// import LanggraphProvider from "@/components/app/provider/langgraph-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/contexts/chat/chat-context";
import { ReactScan } from "@/components/provider/react-scan-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth/auth-context";
// import { AiProvider } from "@/contexts/ai/ai-context";
// import { ProjectProvider } from "@/contexts/project/project-context";
import { getUser } from "@/payload/operations/users-operation";

import "@/styles/globals.css";
import "@copilotkit/react-ui/styles.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Sealos Brain",
  description: "Sealos Brain",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  const payloadUser = isDevelopment ? await getUser() : null;
  if (isDevelopment && !payloadUser) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${lora.className} font-lora antialiased`}>
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
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head>
      <ReactScan />
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <AuthProvider payloadUser={payloadUser}>
            <QueryProvider>
              <ChatProvider>
                <SidebarProvider defaultOpen={false}>
                  <AppSidebar />
                  {children}
                </SidebarProvider>
              </ChatProvider>
            </QueryProvider>
          </AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 1500,
              style: {
                background: "bg-background-secondary",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
