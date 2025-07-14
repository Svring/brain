"use client";

import { createContext, type ReactNode, useState } from "react";
import type { User } from "@/payload-types";
import {
  createSealosApp,
  SessionV1,
  sealosApp,
} from "@zjy365/sealos-desktop-sdk/app";
import { useMount } from "@reactuses/core";

interface AuthContextValue {
  user: User | null;
  auth: SessionV1 | null;
  setUser: (user: User | null) => void;
  setAuth: (auth: SessionV1 | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  auth: null,
  setUser: () => {
    throw new Error("setUser called outside AuthProvider");
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
  const [auth, setAuth] = useState<SessionV1 | null>(null);

  useMount(() => {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      createSealosApp();
      sealosApp.getSession().then((session) => {
        setAuth(session);
      });
    }
  });

  return (
    <AuthContext.Provider value={{ user, auth, setUser, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
