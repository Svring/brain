"use client";

import { Key } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDisclosure, useLocalStorage } from "@reactuses/core";
import { useEffect, useCallback } from "react";

export default function AIAccess() {
  const { auth, state, send } = useAuthContext();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [apiKey, setApiKey] = useLocalStorage("apiKey", "");
  const [baseUrl, setBaseUrl] = useLocalStorage("baseUrl", "");

  // Revised effect: prioritize auth context, then storage, then dialog
  useEffect(() => {
    if (!state.matches("authenticated")) return;

    const authHasCreds = !!auth?.apiKey && !!auth?.baseUrl;

    if (authHasCreds) {
      // Sync auth creds to localStorage if different
      if (auth.apiKey !== apiKey) setApiKey(auth.apiKey);
      if (auth.baseUrl !== baseUrl) setBaseUrl(auth.baseUrl);
      onClose();
      return;
    }

    // Auth missing creds, attempt to use stored ones
    if (apiKey && baseUrl) {
      send({
        type: "SET_AUTH",
        auth: {
          namespace: auth?.namespace ?? "",
          kubeconfig: auth?.kubeconfig ?? "",
          regionUrl: auth?.regionUrl ?? "",
          appToken: auth?.appToken ?? "",
          apiKey,
          baseUrl,
        },
      });
      return;
    }

    // No creds anywhere, prompt user
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, auth, apiKey, baseUrl]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Persist to localStorage via setters
      setApiKey(apiKey);
      setBaseUrl(baseUrl);

      send({
        type: "SET_AUTH",
        auth: {
          namespace: auth?.namespace ?? "",
          kubeconfig: auth?.kubeconfig ?? "",
          regionUrl: auth?.regionUrl ?? "",
          appToken: auth?.appToken ?? "",
          apiKey: apiKey ?? "",
          baseUrl: baseUrl ?? "",
        },
      });
      onClose();
    },
    [apiKey, baseUrl, auth, send, onClose, setApiKey, setBaseUrl]
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Credentials Required</DialogTitle>
            <DialogDescription>
              Please enter your API Key and Base URL to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="API Key"
              value={apiKey ?? ""}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            <Input
              placeholder="Base URL"
              value={baseUrl ?? ""}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
            />
            <button type="submit" className="w-full btn btn-primary">
              Submit
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="w-full flex"
            onClick={onOpen}
            aria-label="Edit API Credentials"
          >
            <Key className="mr-2" />
            <span className="text-sm">API Credentials</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
