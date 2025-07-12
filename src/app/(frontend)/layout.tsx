import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type React from "react";
import LoginPanel from "@/components/app/base/login-panel";
// import { AIProvider } from "@/components/app/base/provider/ai-provider";
import { QueryProvider } from "@/components/app/base/provider/query-provider";
import AppSidebar from "@/components/app/base/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { ProjectProvider } from "@/contexts/project-context";
import { getUser } from "@/payload/operations/users-operation";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import {
  K8sApiContext,
  K8sApiContextSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { runParallelAction } from "next-server-actions-parallel";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

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

async function fetchProjects(
  context: K8sApiContext,
  target: CustomResourceTarget
) {
  const res = await runParallelAction(listCustomResources(context, target));
  return res;
}

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

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["projects", user.namespace],
    queryFn: () =>
      fetchProjects(
        K8sApiContextSchema.parse({
          kubeconfig: user.kubeconfig,
          namespace: user.namespace,
        }),
        {
          type: "custom",
          group: CUSTOM_RESOURCES.instance.group,
          version: CUSTOM_RESOURCES.instance.version,
          plural: CUSTOM_RESOURCES.instance.plural,
        }
      ),
  });
  const dehydratedState = dehydrate(queryClient);

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
            {/* <AIProvider> */}
            <QueryProvider dehydratedState={dehydratedState}>
              <ProjectProvider initialProjectName={null}>
                <SidebarProvider defaultOpen={false}>
                  <AppSidebar />
                  {children}
                </SidebarProvider>
              </ProjectProvider>
            </QueryProvider>
            {/* </AIProvider> */}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
