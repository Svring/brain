"use client";

import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import { cn } from "@/lib/utils";
import type { IngressResource } from "@/lib/k8s/schemas/resource-schemas/ingress-schemas";

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
  const { host, target } = data;

  const getDisplayUrl = () => {
    return host ? `https://${host}` : null;
  };

  const displayUrl = getDisplayUrl();

  return (
    <BaseNode
      target={target}
      className={"p-0 h-10 flex items-center justify-center"}
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
          Public Access
        </span>
      </div>
    </BaseNode>
  );
}
