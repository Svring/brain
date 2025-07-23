"use client";

import { useState } from "react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import { cn } from "@/lib/utils";
import type { IngressResource } from "@/lib/k8s/schemas/resource-schemas/ingress-schemas";
import { useFlowState, useFlowActions } from "@/contexts/flow/flow-context";
import { useMount } from "@reactuses/core";
import { Badge } from "@/components/ui/badge";
import { Network, ExternalLink } from "lucide-react";

interface IngressNodeProps {
  name: string;
  host: string;
  target: BuiltinResourceTarget;
  resource: IngressResource; // Full resource for accessing labels and metadata
}

interface IngressNodeComponentProps {
  data: IngressNodeProps;
}

export default function IngressNode({ data }: IngressNodeComponentProps) {
  const { name, host, target, resource } = data;
  const [showConnectionMenu, setShowConnectionMenu] = useState(false);

  const getDisplayUrl = () => {
    return host ? `https://${host}` : null;
  };

  const displayUrl = getDisplayUrl();

  const handleOpenUrl = (e: React.MouseEvent) => {
    if (displayUrl) {
      e.preventDefault();
      e.stopPropagation();
      window.open(displayUrl, "_blank", "noopener");
    }
  };

  const floatingMenuOptions = displayUrl
    ? [
        {
          label: "Open URL",
          onClick: () => window.open(displayUrl, "_blank", "noopener"),
          Icon: <ExternalLink className="w-4 h-4" />,
        },
      ]
    : [];

  return (
    <BaseNode
      target={target}
      className={"p-4"}
      showDefaultMenu={!showConnectionMenu}
      floatingMenuOptions={floatingMenuOptions}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Network className="rounded-lg h-9 w-9 p-1.5" />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  Ingress
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-40 overflow-hidden text-ellipsis text-left">
                  {name}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* URL badge */}
        <div className="mt-auto flex justify-start">
          <Badge
            variant="outline"
            className={cn(
              displayUrl
                ? "border-blue-600 text-blue-700 hover:underline cursor-pointer"
                : "text-muted-foreground cursor-not-allowed opacity-60"
            )}
            onClick={handleOpenUrl}
          >
            {displayUrl ? displayUrl : "No URL available"}
          </Badge>
        </div>
      </div>
    </BaseNode>
  );
}
