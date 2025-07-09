import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type React from "react";
import LoginPanel from "@/components/app/base/login-panel";
import { AIProvider } from "@/components/app/base/provider/ai-provider";
import { QueryProvider } from "@/components/app/base/provider/query-provider";
import AppSidebar from "@/components/app/base/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
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
  const user = await getUser();

  if (!user) {
    return (
      <html lang="en">
        <body
          className={`${nunito.variable} h-screen w-screen font-nunito antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <LoginPanel />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <AuthProvider initialUser={user}>
            <AIProvider>
              <QueryProvider>
                <SidebarProvider defaultOpen={false}>
                  <AppSidebar />
                  {children}
                </SidebarProvider>
              </QueryProvider>
            </AIProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
