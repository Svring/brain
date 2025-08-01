"use client";

import { Key, ChevronsUpDown, Plus, Brain, Settings, Edit } from "lucide-react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useAiState, useAiActions } from "@/contexts/ai/ai-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { listAiProxyTokensOptions } from "@/lib/sealos/ai-proxy/ai-proxy-method/ai-proxy-query";
import { createAiProxyContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";

interface AuthMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
}

export default function AIAccess() {
  const { auth } = useAuthState();
  const { aiState } = useAiState();
  const { setState, credentialsLoaded } = useAiActions();
  const { isMobile, state: sidebarState } = useSidebar();
  const [activeMethod, setActiveMethod] = useState<AuthMethod | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const isCollapsed = sidebarState === "collapsed";

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
  const hasCustomCredentials = !!(
    aiState?.api_key &&
    aiState?.base_url &&
    !isBrainActive
  );

  // Load existing custom credentials into form
  useEffect(() => {
    if (hasCustomCredentials && !isBrainActive) {
      setApiKey(aiState?.api_key || "");
      setBaseUrl(aiState?.base_url || "");
    }
  }, [hasCustomCredentials, isBrainActive, aiState]);

  // Define available methods
  const authMethods: AuthMethod[] = [
    {
      id: "brain",
      name: "Brain Token",
      description: brainToken ? "Available" : "Not available",
      icon: Brain,
      active: isBrainActive,
    },
    {
      id: "custom",
      name: "Custom API",
      description: hasCustomCredentials ? "Configured" : "Not configured",
      icon: Settings,
      active: hasCustomCredentials,
    },
  ];

  // Set active method based on current state
  useEffect(() => {
    if (isBrainActive) {
      setActiveMethod(authMethods.find((m) => m.id === "brain") || null);
    } else if (hasCustomCredentials) {
      setActiveMethod(authMethods.find((m) => m.id === "custom") || null);
    } else {
      setActiveMethod(null);
    }
  }, [isBrainActive, hasCustomCredentials]);

  const handleUseBrain = () => {
    if (brainToken) {
      setState({
        api_key: brainToken.key,
        base_url: `https://aiproxy.${auth?.regionUrl}/v1`,
      });
      credentialsLoaded();
    }
  };

  const handleUseCustom = () => {
    if (hasCustomCredentials) {
      // Credentials exist, directly switch to custom without dialog
      setState({ api_key: aiState?.api_key, base_url: aiState?.base_url });
      credentialsLoaded();
    } else {
      // No credentials exist, open dialog to configure
      setIsDialogOpen(true);
    }
  };

  const handleConfigureCustom = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setIsDialogOpen(true);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey && baseUrl) {
      setState({ api_key: apiKey, base_url: baseUrl });
      credentialsLoaded();
      setIsDialogOpen(false);
    }
  };

  const displayName = activeMethod?.name || "No Credentials";
  const displayDescription = activeMethod?.description || "Click to configure";

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom API Configuration</DialogTitle>
            <DialogDescription>
              Enter your custom API credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCustom} className="space-y-4">
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
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Save Configuration
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="group-data-[collapsible=icon]:justify-center"
                size="lg"
                tooltip={{
                  children: `${displayName}: ${displayDescription}`,
                }}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                  {activeMethod ? (
                    <activeMethod.icon className="size-4" />
                  ) : (
                    <Key className="size-4" />
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="grid flex-1 overflow-hidden text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {displayDescription}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Authentication Methods
              </DropdownMenuLabel>

              {/* Brain Token Option */}
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={handleUseBrain}
                disabled={!brainToken}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Brain className="size-4 shrink-0" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Brain Token</div>
                  <div className="text-xs text-muted-foreground">
                    {brainToken
                      ? isBrainActive
                        ? "Active"
                        : "Available"
                      : "Not available"}
                  </div>
                </div>
                {isBrainActive && (
                  <div className="size-2 rounded-full bg-green-500" />
                )}
              </DropdownMenuItem>

              {/* Custom API Option */}
              <DropdownMenuItem className="gap-2 p-2" onClick={handleUseCustom}>
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Settings className="size-4 shrink-0" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Custom API</div>
                  <div className="text-xs text-muted-foreground">
                    {hasCustomCredentials
                      ? activeMethod?.id === "custom"
                        ? "Active"
                        : "Configured"
                      : "Configure"}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {hasCustomCredentials && activeMethod?.id === "custom" && (
                    <div className="size-2 rounded-full bg-green-500" />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={handleConfigureCustom}
                  >
                    <Edit className="size-3" />
                  </Button>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Add new method placeholder */}
              <DropdownMenuItem className="gap-2 p-2" disabled>
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add method
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
