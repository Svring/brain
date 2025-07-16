"use client";

import { createContext, type ReactNode, use } from "react";
import type { User } from "@/payload-types";
import { useAuth } from "@/hooks/app/auth/use-auth";

export interface Auth {
  namespace: string;
  kubeconfig: string;
  regionUrl: string;
  appToken: string;
  baseUrl: string;
  apiKey: string;
}

interface AuthContextValue {
  auth: Auth | null;
  authenticating: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  auth: null,
  authenticating: true,
});

export const AuthProvider = ({
  children,
  payloadUser,
}: {
  children: ReactNode;
  payloadUser: User | null;
}) => {
  const { auth, authenticating } = useAuth({ payloadUser });

  if (authenticating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Authenticating...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, authenticating }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const { auth } = use(AuthContext);
  return { auth };
}
