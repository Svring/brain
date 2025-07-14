"use client";

import { createContext, type ReactNode, useState, useContext } from "react";
import type { User } from "@/payload-types";
import { SessionV1 } from "@zjy365/sealos-desktop-sdk/app";
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
  user: User | null;
  session: SessionV1 | null;
  auth: Auth | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: SessionV1 | null) => void;
  setAuth: (auth: Auth | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  auth: null,
  isLoading: true,
  setUser: () => {
    throw new Error("setUser called outside AuthProvider");
  },
  setSession: () => {
    throw new Error("setSession called outside AuthProvider");
  },
  setAuth: () => {
    throw new Error("setAuth called outside AuthProvider");
  },
});

export const AuthProvider = ({
  children,
  payloadUser,
}: {
  children: ReactNode;
  payloadUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(payloadUser);
  const { session, auth, isLoading, setSession, setAuth } = useAuth({
    payloadUser,
  });

  return (
    <AuthContext.Provider
      value={{ user, session, auth, isLoading, setUser, setSession, setAuth }}
    >
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <div>Loading authentication...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const { auth } = useContext(AuthContext);
  return { auth };
}
