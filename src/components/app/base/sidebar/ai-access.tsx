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
import { useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">AI Proxy Tokens</h4>
              <Button
                size="sm"
                onClick={handleCreateToken}
                disabled={createTokenMutation.isPending}
              >
                {createTokenMutation.isPending ? "Creating..." : "Create Token"}
              </Button>
            </div>

            {tokens?.data?.tokens && tokens.data.tokens.length > 0 ? (
              <div className="space-y-2">
                {tokens.data.tokens.map((token) => (
                  <div
                    key={token.name}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium text-sm">{token.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Created:{" "}
                        {new Date(token.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {token.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteToken(token.id)}
                        disabled={deleteTokenMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                No tokens found
              </div>
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
            <span className="">API Credentials</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
