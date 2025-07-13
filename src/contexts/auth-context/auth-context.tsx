"use client";

import { createContext, type ReactNode, useState } from "react";
import type { User } from "@/payload-types";
import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { useLocalStorage, useMount } from "@reactuses/core";

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {
    throw new Error("setUser called outside AuthProvider");
  },
});

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) => {
  const [session, setSession] = useLocalStorage("session", null);
  const [user, setUser] = useState<User | null>(initialUser);

  useMount(() => {
    createSealosApp();
    if (!session) {
      (async () => {
        try {
          const res = await sealosApp.getSession();
          setSession(JSON.stringify(res));
          console.log("res", res);
        } catch (err) {
          console.log("App is not running in desktop");
        }
      })();
    } else {
      console.log("session", session);
    }
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
