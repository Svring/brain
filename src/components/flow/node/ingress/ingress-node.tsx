"use client";

import BaseNode from "../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface IngressNodeProps {
  name: string;
  host: string;
  target: BuiltinResourceTarget;
}

interface IngressNodeComponentProps {
  data: IngressNodeProps;
  className?: string;
}

export default function IngressNode({
  data,
  className,
}: IngressNodeComponentProps) {
  const { name, host, target } = data;
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const siteUrl = `http://${host}`;

  useEffect(() => {
    // Reset states when host changes
    setPreviewLoaded(false);
    setPreviewError(false);
    setShowPreview(false);

    // Small delay to show preview to avoid immediate loading
    const timer = setTimeout(() => {
      setShowPreview(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [host]);

  const handlePreviewLoad = () => {
    setPreviewLoaded(true);
    setPreviewError(false);
  };

  const handlePreviewError = () => {
    setPreviewError(true);
    setPreviewLoaded(true);
  };

  return (
    <BaseNode
      target={target}
      className={cn(
        className,
        "p-0 w-44 h-10 flex items-center justify-center"
      )}
    >
      <div className="flex items-center justify-center w-full h-full px-2">
        <span
          className={cn(
            "text-base font-semibold select-none",
            host
              ? "text-foreground hover:underline cursor-pointer"
              : "text-muted-foreground cursor-not-allowed opacity-60"
          )}
          tabIndex={host ? 0 : -1}
          role="link"
          aria-label={host ? `Open ${host}` : undefined}
          onClick={
            host
              ? () => window.open(`http://${host}`, "_blank", "noopener")
              : undefined
          }
          onKeyDown={
            host
              ? (e) => {
                  if (
                    (e.key === "Enter" || e.key === " ") &&
                    !e.defaultPrevented
                  ) {
                    window.open(`http://${host}`, "_blank", "noopener");
                  }
                }
              : undefined
          }
        >
          Public Access
        </span>
      </div>
    </BaseNode>
  );
}
