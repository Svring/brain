import type React from "react";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "Sealos Brain",
  description: "Sealos Brain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
