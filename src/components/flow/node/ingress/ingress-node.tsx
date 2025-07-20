"use client";

import { useEffect, useState } from "react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import { cn } from "@/lib/utils";
import { checkReadyDeploy } from "@/lib/sealos/deploy/deploy-api/deploy-old-api";
import { createDeployContext } from "@/lib/sealos/deploy/deploy-utils";
import { runParallelAction } from "next-server-actions-parallel";
import type { IngressResource } from "@/lib/k8s/schemas/resource-schemas/ingress-schemas";

interface IngressNodeProps {
  name: string;
  host: string;
  target: BuiltinResourceTarget;
  resource: IngressResource; // Full resource for accessing labels and metadata
  appName?: string; // Optional, extracted from labels
  devboxName?: string; // Optional, extracted from labels
}

interface IngressNodeComponentProps {
  data: IngressNodeProps;
  className?: string;
}

interface ReadyStatus {
  ready: boolean;
  url?: string;
  error?: string;
}

export default function IngressNode({
  data,
  className,
}: IngressNodeComponentProps) {
  const { host, target, appName, devboxName, resource } = data;
  const [readyStatus, setReadyStatus] = useState<ReadyStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Create context at component level - only when appName exists
  const deployContext = appName ? createDeployContext() : null;

  useEffect(() => {
    // Only check ready status for apps (not devboxes)
    if (!appName || !deployContext) return;

    // Use the checkReady API for apps
    checkAppReady();
    const interval = setInterval(checkAppReady, 30000);
    return () => clearInterval(interval);
  }, [appName, deployContext]);

  const checkAppReady = async () => {
    if (!appName || !deployContext || isChecking) return;

    setIsChecking(true);
    try {
      const response = await runParallelAction(
        checkReadyDeploy({ appName }, deployContext)
      );

      if (response.data && response.data.length > 0) {
        const status = response.data[0];
        setReadyStatus({
          ready: status.ready,
          url: status.url,
          error: status.error,
        });
      } else {
        setReadyStatus({ ready: false, error: "No status data" });
      }
    } catch (error) {
      console.warn("Failed to check app ready status:", error);
      setReadyStatus({ ready: false, error: "API error" });
    } finally {
      setIsChecking(false);
    }
  };

  const getDisplayUrl = () => {
    if (readyStatus?.url) {
      return readyStatus.url;
    }
    return host ? `https://${host}` : null;
  };

  const getDisplayText = () => {
    if (devboxName) {
      return "Devbox Access";
    }
    if (appName) {
      return "Public Access";
    }
    return "External Access";
  };

  const displayUrl = getDisplayUrl();
  const isReady = readyStatus?.ready ?? null;

  return (
    <BaseNode
      target={target}
      className={cn(
        className,
        "p-0 h-10 flex items-center justify-center",
        isReady === false && "border-2 border-red-500",
        isChecking && "opacity-70"
      )}
      showDefaultMenu={false}
    >
      <div className="flex items-center justify-center w-full h-full px-2">
        <span
          className={cn(
            "text-base font-semibold select-none",
            displayUrl
              ? "text-foreground hover:underline cursor-pointer"
              : "text-muted-foreground cursor-not-allowed opacity-60"
          )}
          tabIndex={displayUrl ? 0 : -1}
          role="link"
          aria-label={displayUrl ? `Open ${displayUrl}` : undefined}
          onClick={
            displayUrl
              ? () => window.open(displayUrl, "_blank", "noopener")
              : undefined
          }
          onKeyDown={
            displayUrl
              ? (e) => {
                  if (
                    (e.key === "Enter" || e.key === " ") &&
                    !e.defaultPrevented
                  ) {
                    window.open(displayUrl, "_blank", "noopener");
                  }
                }
              : undefined
          }
        >
          {getDisplayText()}
          {isChecking && " (checking...)"}
          {readyStatus?.error && ` (${readyStatus.error})`}
        </span>
      </div>
    </BaseNode>
  );
}
