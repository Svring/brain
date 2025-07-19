"use client";

import { Key } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { useAiContext } from "@/contexts/ai-context/ai-context";
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
import { useDisclosure } from "@reactuses/core";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { listAiProxyTokensOptions } from "@/lib/sealos/ai-proxy/ai-proxy-method/ai-proxy-query";
import { createAiProxyContext } from "@/lib/sealos/ai-proxy/ai-proxy-utils";
import { useQuery } from "@tanstack/react-query";

export default function AIAccess() {
  const { auth, state } = useAuthContext();
  const { aiState, send: aiSend } = useAiContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [authMode, setAuthMode] = useState<"brain" | "custom">("brain");

  // Get brain token
  const aiProxyContext = auth ? createAiProxyContext() : null;
  const { data: tokens } = useQuery({
    ...listAiProxyTokensOptions(aiProxyContext!),
    enabled: !!aiProxyContext,
  });
  const brainToken = tokens?.data?.tokens?.find(
    (token: any) => token.name === "brain"
  );
  const isBrainActive = aiState?.api_key === brainToken?.key;

  // Auto-detect mode and show dialog if needed
  useEffect(() => {
    if (!state.matches("authenticated")) return;

    if (isBrainActive) {
      setAuthMode("brain");
    } else if (aiState?.api_key && aiState?.base_url) {
      setAuthMode("custom");
    }

    const hasCredentials = !!(aiState?.api_key && aiState?.base_url);
    if (hasCredentials) {
      onClose();
    } else {
      onOpen();
    }
  }, [state, aiState, isBrainActive, onClose, onOpen]);

  const handleUseBrain = () => {
    if (brainToken) {
      aiSend({
        type: "SET_STATE",
        state: {
          api_key: brainToken.key,
          base_url: `https://aiproxy.${auth?.regionUrl}/v1`,
        },
      });
      aiSend({ type: "CREDENTIALS_LOADED" });
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    aiSend({
      type: "SET_STATE",
      state: { api_key: apiKey, base_url: baseUrl },
    });
    aiSend({ type: "CREDENTIALS_LOADED" });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Credentials</DialogTitle>
            <DialogDescription>
              Choose your authentication method.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup
              value={authMode}
              onValueChange={(v: "brain" | "custom") => setAuthMode(v)}
            >
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
              brainToken ? (
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
                <div className="text-sm text-muted-foreground text-center py-4">
                  No brain token found. Please create one in the AI Proxy
                  service.
                </div>
              )
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
                <Input
                  placeholder="Base URL"
                  value={baseUrl}
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
          <SidebarMenuButton className="w-full flex" onClick={onOpen}>
            <Key className="mr-1" />
            <div className="flex flex-col items-start">
              <span className="text-sm">API Credentials</span>
              {aiState?.api_key && (
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
