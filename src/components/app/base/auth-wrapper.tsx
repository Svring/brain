"use client";

import { use, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import Login from "./auth/login";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user } = use(AuthContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading during hydration to prevent layout shift
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show login if no user is authenticated
  if (!user) {
    return <Login />;
  }

  // Show the main application
  return <>{children}</>;
}
