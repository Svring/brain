"use client";

import { Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useAiProxyContext } from "@/lib/auth/auth-utils";
import { listAiProxyTokensOptions } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-query";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function BrainTokenStats() {
  const { auth } = useAuthState();
  const aiProxyContext = auth ? useAiProxyContext() : null;
  
  const { data: aiProxyTokens, isLoading } = useQuery({
    ...listAiProxyTokensOptions(aiProxyContext!),
    enabled: !!aiProxyContext,
  });

  const brainToken = aiProxyTokens?.tokens?.find(
    (token: any) => token.name === "brain"
  );

  // Don't render if no brain token or still loading
  if (isLoading || !brainToken) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton>
                <Brain className="h-4 w-4" />
                <span>Brain Token</span>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-2">
                <div className="font-semibold">Brain Token Usage</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requests:</span>
                    <span className="font-mono">
                      {formatNumber(brainToken.request_count)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used Amount:</span>
                    <span className="font-mono">
                      {formatNumber(brainToken.used_amount)}
                    </span>
                  </div>
                  {brainToken.quota && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quota:</span>
                      <span className="font-mono">
                        {formatNumber(brainToken.quota)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
