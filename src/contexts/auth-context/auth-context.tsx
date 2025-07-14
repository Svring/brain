"use client";

import {
  createContext,
  type ReactNode,
  useEffect,
  useState,
  useContext,
} from "react";
import type { User } from "@/payload-types";
import {
  createSealosApp,
  SessionV1,
  sealosApp,
} from "@zjy365/sealos-desktop-sdk/app";
import { useMount } from "@reactuses/core";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { useLocalStorage } from "@reactuses/core";
import _ from "lodash";

interface Auth {
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

export const AuthContext = createContext<AuthContextValue>({
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

  useMount(async () => {
    const isProduction = process.env.NODE_ENV === "production";

    // Helper function to parse auth from localStorage
    const parseAuthFromStorage = () => {
      if (!_.isString(sealosBrainAuth) || _.isEmpty(sealosBrainAuth))
        return null;
      const parsedAuth = _.attempt(() => JSON.parse(sealosBrainAuth) as Auth);
      if (_.isError(parsedAuth)) {
        console.error(
          "Failed to parse auth data from localStorage:",
          parsedAuth
        );
        setSealosBrainAuth("");
        return null;
      }
      return parsedAuth;
    };

    // Helper function to extract auth from session
    const extractAuthFromSession = async (session: SessionV1) => {
      if (!_.has(session, "kubeconfig") || !_.has(session, "token"))
        return null;

      const [namespace, regionUrl] = await Promise.all([
        getCurrentNamespace(session.kubeconfig),
        getRegionUrlFromKubeconfig(session.kubeconfig),
      ]);

      return _.every([namespace, regionUrl], _.isString)
        ? ({
            namespace: namespace!,
            kubeconfig: session.kubeconfig,
            regionUrl: regionUrl!,
            appToken: _.isString(session.token) ? session.token : "",
            baseUrl: "",
            apiKey: "",
          } as Auth)
        : null;
    };

    // Development mode: only use localStorage
    if (!isProduction) {
      const authFromStorage = parseAuthFromStorage();
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
    const session = await sealosApp.getSession();
    setSession(session);

    if (_.isNil(session)) {
      // Log when session is nil
      // eslint-disable-next-line no-console
      console.log("[AuthContext] session is nil, aborting auth extraction.");
      setIsLoading(false);
      return;
    }

    // Try localStorage first
    const authFromStorage = parseAuthFromStorage();
    if (authFromStorage) {
      // eslint-disable-next-line no-console
      console.log(
        "[AuthContext] Loaded auth from localStorage:",
        authFromStorage
      );
      setAuth(authFromStorage);
      setIsLoading(false);
      return;
    }

    // Fallback to session extraction
    // eslint-disable-next-line no-console
    console.log(
      "[AuthContext] No auth in localStorage, extracting from session..."
    );
    const authFromSession = await _.attempt(() =>
      extractAuthFromSession(session)
    );
    if (!_.isError(authFromSession) && !_.isNil(authFromSession)) {
      // eslint-disable-next-line no-console
      console.log("[AuthContext] authFromSession:", authFromSession);
      setAuth(authFromSession);
    } else if (_.isError(authFromSession)) {
      // eslint-disable-next-line no-console
      console.error(
        "Failed to extract auth data from session:",
        authFromSession
      );
    }

    // Always set loading to false at the end, regardless of success or failure
    setIsLoading(false);
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
