"use client";

import { useEffect, useState } from "react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import { cn } from "@/lib/utils";
import { checkReadyDeploy } from "@/lib/sealos/deploy/deploy-api/deploy-old-api";
import { createDeployContext } from "@/lib/sealos/deploy/deploy-utils";
import { runParallelAction } from "next-server-actions-parallel";

interface IngressNodeProps {
  name: string;
  host: string;
  target: BuiltinResourceTarget;
  appName?: string; // The deploy app name for checkReady API
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
  const { host, target, appName } = data;
  const [readyStatus, setReadyStatus] = useState<ReadyStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!appName) {
      // Fallback to old host checking if no appName provided
      checkHostAvailability();
      const interval = setInterval(checkHostAvailability, 30000);
      return () => clearInterval(interval);
    }

    // Use the new checkReady API
    checkAppReady();
    const interval = setInterval(checkAppReady, 30000);
    return () => clearInterval(interval);
  }, [host, appName]);

  const checkHostAvailability = async () => {
    if (!host) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(`http://${host}`, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setReadyStatus({ ready: true, url: `http://${host}` });
    } catch (error) {
      setReadyStatus({ ready: false, error: "fetch error" });
    }
  };

  const checkAppReady = async () => {
    if (!appName || isChecking) return;

    setIsChecking(true);
    try {
      const context = createDeployContext();
      const response = await runParallelAction(
        checkReadyDeploy({ appName }, context)
      );

      if (response.data && response.data.length > 0) {
        const status = response.data[0];
        setReadyStatus({
          ready: status.ready,
          url: status.url,
          error: status.error,
        });
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
    return host ? `http://${host}` : null;
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
          Public Access
          {isChecking && " (checking...)"}
          {readyStatus?.error && ` (${readyStatus.error})`}
        </span>
      </div>
    </BaseNode>
  );
}
