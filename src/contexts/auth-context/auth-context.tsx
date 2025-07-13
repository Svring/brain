"use client";

import { createContext, type ReactNode, useState, useEffect } from "react";
import type { User } from "@/payload-types";
import { useLocalStorage } from "@reactuses/core";

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

interface ManualAuthData {
  kubeconfig: string;
  regionToken: string;
  appToken: string;
  devboxToken: string;
}

// Utility function to get manual auth data from localStorage
const getManualAuthData = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedData = localStorage.getItem("sealos-brain-auth");
    if (!storedData) return null;

    const authData: ManualAuthData = JSON.parse(storedData);

    // Convert manual auth data to User format
    return {
      id: `manual-${Date.now()}`,
      email: "dev@sealos.io", // Default email for manual auth
      context: null,
      namespace: "default", // Default namespace for manual auth
      regionUrl: null,
      kubeconfig: authData.kubeconfig,
      regionToken: authData.regionToken,
      appToken: authData.appToken,
      devboxToken: authData.devboxToken,
      apiKey: null,
      baseUrl: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      resetPasswordToken: null,
      resetPasswordExpiration: null,
      salt: null,
      hash: null,
      loginAttempts: null,
      lockUntil: null,
      password: null,
    };
  } catch (error) {
    console.error("Failed to parse manual auth data:", error);
    return null;
  }
};

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    // If no initial user from server, check localStorage for manual auth data
    if (!initialUser) {
      const manualUser = getManualAuthData();
      if (manualUser) {
        setUser(manualUser);
      }
    }
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
