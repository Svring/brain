import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type React from "react";
import Login from "@/components/app/auth/login";
import { CopilotProvider } from "@/components/app/provider/copilot-provider";
import { QueryProvider } from "@/components/app/provider/query-provider";
import AppSidebar from "@/components/app/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth/auth-context";
import { AiProvider } from "@/contexts/ai/ai-context";
import { ProjectProvider } from "@/contexts/project/project-context";
import { getUser } from "@/payload/operations/users-operation";

import "@/styles/globals.css";
import "@copilotkit/react-ui/styles.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
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
        <body className={`${nunito.variable} font-nunito antialiased`}>
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
      <body className={`${nunito.variable} font-nunito antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <AuthProvider payloadUser={payloadUser}>
            <CopilotProvider>
              <QueryProvider>
                <AiProvider payloadUser={payloadUser}>
                  <ProjectProvider>
                    <SidebarProvider defaultOpen={false}>
                      <AppSidebar />
                      {children}
                    </SidebarProvider>
                  </ProjectProvider>
                </AiProvider>
              </QueryProvider>
            </CopilotProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
