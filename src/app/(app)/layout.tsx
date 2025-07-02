import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import type React from "react";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/components/app/base/provider/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { getUser } from "@/payload/operations/users-operation";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400"],
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <AuthProvider initialUser={user}>
            <QueryProvider>{children}</QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
