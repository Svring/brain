import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type React from "react";
import { AIProvider } from "@/components/app/base/provider/ai-provider";
import { QueryProvider } from "@/components/app/base/provider/query-provider";
import AppSidebar from "@/components/app/base/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context/auth-context";
import { ProjectProvider } from "@/contexts/project-context/project-context";
import { getUser } from "@/payload/operations/users-operation";
import Login from "@/components/app/base/auth/login";

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
            <AIProvider>
              <QueryProvider>
                <ProjectProvider>
                  <SidebarProvider defaultOpen={false}>
                    <AppSidebar />
                    {children}
                  </SidebarProvider>
                </ProjectProvider>
              </QueryProvider>
            </AIProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
