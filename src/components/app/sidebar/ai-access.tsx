"use client";

import { Key, Trash2 } from "lucide-react";
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
import { useEffect, useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  useCreateAiProxyTokenMutation,
  useDeleteAiProxyTokenMutation,
} from "@/lib/sealos/ai-proxy/ai-proxy-mutation";
import { listAiProxyTokensOptions } from "@/lib/sealos/ai-proxy/ai-proxy-query";
import { createAiProxyContext } from "@/lib/sealos/ai-proxy/ai-proxy-utils";
import { useQuery } from "@tanstack/react-query";

export default function AIAccess() {
  const { auth, state, send } = useAuthContext();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [apiKey, setApiKey] = useLocalStorage("apiKey", "");
  const [baseUrl, setBaseUrl] = useLocalStorage("baseUrl", "");
  const [authMode, setAuthMode] = useState<"brain" | "custom">("brain");

  // AI Proxy context and queries
  const aiProxyContext = auth ? createAiProxyContext() : null;
  const { data: tokens } = useQuery({
    ...listAiProxyTokensOptions(aiProxyContext!),
    enabled: !!aiProxyContext,
  });
  const createTokenMutation = useCreateAiProxyTokenMutation(aiProxyContext!);
  const deleteTokenMutation = useDeleteAiProxyTokenMutation(aiProxyContext!);

  const handleCreateToken = () => {
    createTokenMutation.mutate({
      name: "brain",
    });
  };

  const handleDeleteToken = (tokenId: number) => {
    if (confirm("Are you sure you want to delete this token?")) {
      deleteTokenMutation.mutate({ id: tokenId });
    }
  };

  // Check if brain token is available and active
  const brainToken = tokens?.data?.tokens?.find((token: any) => token.name === 'brain');
  const isBrainActive = auth?.apiKey === brainToken?.key;
  
  // Determine current auth mode based on active credentials
  useEffect(() => {
    if (isBrainActive) {
      setAuthMode("brain");
    } else if (auth?.apiKey && auth?.baseUrl) {
      setAuthMode("custom");
    }
  }, [auth, isBrainActive]);

  // Revised effect: prioritize auth context, then storage, then dialog
  useEffect(() => {
    if (!state.matches("authenticated")) return;

    const authHasCreds = !!auth?.apiKey && !!auth?.baseUrl;

    if (authHasCreds) {
      // Sync auth creds to localStorage if different and in custom mode
      if (!isBrainActive) {
        if (auth.apiKey !== apiKey) setApiKey(auth.apiKey);
        if (auth.baseUrl !== baseUrl) setBaseUrl(auth.baseUrl);
      }
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
  }, [state, auth, apiKey, baseUrl, isBrainActive]);

  const handleUseBrain = useCallback(() => {
    if (brainToken) {
      const brainBaseUrl = `https://aiproxy-web.${auth?.regionUrl}/api`;
      send({
        type: "SET_AUTH",
        auth: {
          namespace: auth?.namespace ?? "",
          kubeconfig: auth?.kubeconfig ?? "",
          regionUrl: auth?.regionUrl ?? "",
          appToken: auth?.appToken ?? "",
          apiKey: brainToken.key,
          baseUrl: brainBaseUrl,
        },
      });
      setAuthMode("brain");
      onClose();
    }
  }, [brainToken, auth, send, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (authMode === "custom") {
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
      }
      onClose();
    },
    [authMode, apiKey, baseUrl, auth, send, onClose, setApiKey, setBaseUrl]
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Credentials</DialogTitle>
            <DialogDescription>
              Choose your authentication method.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RadioGroup value={authMode} onValueChange={(value: "brain" | "custom") => setAuthMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="brain" id="brain" />
                <Label htmlFor="brain">Use Brain Token</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom API Key</Label>
              </div>
            </RadioGroup>

            {authMode === "brain" ? (
              <div className="space-y-3">
                {brainToken ? (
                  <div className="p-3 border rounded bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">brain</div>
                        <div className="text-xs text-muted-foreground">
                          {isBrainActive ? "Currently Active" : "Available"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleUseBrain}
                        disabled={isBrainActive}
                      >
                        {isBrainActive ? "Active" : "Use"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      No brain token found. Create one to use this option.
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCreateToken}
                      disabled={createTokenMutation.isPending}
                      className="w-full"
                    >
                      {createTokenMutation.isPending ? "Creating..." : "Create Brain Token"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
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
                <Button type="submit" className="w-full">
                  Use Custom Credentials
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="w-full flex"
            onClick={onOpen}
            aria-label="Edit API Credentials"
          >
            <Key className="mr-1" />
            <div className="flex flex-col items-start">
              <span className="text-sm">API Credentials</span>
              {auth?.apiKey && (
                <span className="text-xs text-muted-foreground">
                  {isBrainActive ? "Brain Token" : "Custom"}
                </span>
              )}
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
