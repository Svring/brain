"use client";

import { useState, useEffect } from "react";
import { useLocalStorage, useMount } from "@reactuses/core";
import _ from "lodash";
import type { User } from "@/payload-types";
import {
  createSealosApp,
  SessionV1,
  sealosApp,
} from "@zjy365/sealos-desktop-sdk/app";
import {
  parseAuthFromStorage,
  extractAuthFromSession,
} from "@/lib/app/auth/auth-utils";
import type { Auth } from "@/contexts/auth-context";

interface UseAuthOptions {
  payloadUser?: User | null;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { payloadUser } = options;
  const [session, setSession] = useState<SessionV1 | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sealosBrainAuth, setSealosBrainAuth] = useLocalStorage(
    "sealos-brain-auth",
    ""
  );

  // Sync auth state to localStorage whenever auth changes
  useEffect(() => {
    setSealosBrainAuth(JSON.stringify(auth));
  }, [auth, setSealosBrainAuth]);

  const initializeAuth = async () => {
    const isProduction = process.env.NEXT_PUBLIC_MODE === "production";

    // Development mode: only use localStorage
    if (!isProduction) {
      const authFromStorage = parseAuthFromStorage(
        sealosBrainAuth || "",
        setSealosBrainAuth
      );
      if (authFromStorage) {
        setAuth(authFromStorage);
        setIsLoading(false);
        return;
      }
      // If payloadUser is present, fill auth from User fields
      if (payloadUser) {
        setAuth({
          namespace: payloadUser.namespace || "",
          kubeconfig: payloadUser.kubeconfig || "",
          regionUrl: payloadUser.regionUrl || "",
          appToken: payloadUser.appToken || "",
          baseUrl: payloadUser.baseUrl || "",
          apiKey: payloadUser.apiKey || "",
        });
      }
      setIsLoading(false);
      return;
    }

    // Production mode
    createSealosApp();
    const sessionData = await sealosApp.getSession();
    setSession(sessionData);

    if (_.isNil(sessionData)) {
      setIsLoading(false);
      return;
    }

    // Try localStorage first
    const authFromStorage = parseAuthFromStorage(
      sealosBrainAuth || "",
      setSealosBrainAuth
    );
    if (authFromStorage) {
      setAuth(authFromStorage);
      setIsLoading(false);
      return;
    }

    // Fallback to session extraction
    const authFromSession = await _.attempt(() =>
      extractAuthFromSession(sessionData)
    );
    if (!_.isError(authFromSession) && !_.isNil(authFromSession)) {
      setAuth(authFromSession);
    }
    setIsLoading(false);
  };

  useMount(initializeAuth);

  return {
    session,
    auth,
    isLoading,
    setSession,
    setAuth,
    initializeAuth,
  };
}
