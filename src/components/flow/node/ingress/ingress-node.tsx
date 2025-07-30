"use client";

import BaseNode from "../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { cn } from "@/lib/utils";
import { Network, Globe, Copy } from "lucide-react";
import useIngressNode from "@/hooks/sealos/ingress/use-ingress-node";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { toast } from "sonner";
import { checkUrl } from "@/lib/sealos/ingress/ingress-method/ingress-utils";

export default function IngressNode({
  data: { target },
}: {
  data: {
    target: BuiltinResourceTarget;
  };
}) {
  const k8sContext = createK8sContext();
  const { data, isLoading } = useIngressNode(k8sContext, target);

  if (isLoading) {
    return null;
  }

  const { layer, host, affiliation, protocol } = data;

  return (
    <BaseNode
      target={target}
      nodeData={data}
      className={"p-4 h-27"}
      showDefaultMenu={false}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-4">
              <Network className="rounded-lg h-9 w-9 p-1.5 bg-muted" />
              <span className="flex flex-col">
                <span className="text-lg leading-none">Ingress</span>
              </span>
            </span>
          </div>
        </div>

        {/* Layer and Host */}
        <div className="flex items-center gap-2 mt-2">
          <Globe
            className={cn(
              "h-4 w-4",
              layer === "application" ? "text-theme-green" : "text-theme-blue"
            )}
          />
          {host ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {layer === "application" ? (
                <>
                  <span
                    className="text-sm text-muted-foreground truncate cursor-pointer hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = `${
                        protocol
                          ? protocol.toLowerCase() + "s" + "://"
                          : "https://"
                      }${host}`;
                      window.open(url, "_blank");
                    }}
                  >
                    {`${
                      protocol
                        ? protocol.toLowerCase() + "s" + "://"
                        : "https://"
                    }${host}`}
                  </span>
                  <Copy
                    className="h-4 w-4 hover:text-foreground cursor-pointer transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = `${
                        protocol
                          ? protocol.toLowerCase() + "s" + "://"
                          : "https://"
                      }${host}`;
                      navigator.clipboard.writeText(url);
                      console.log("url", url);
                      toast("URL copied to clipboard");
                    }}
                  />
                </>
              ) : (
                <span
                  className="text-sm truncate cursor-pointer hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `${
                      protocol ? protocol.toLowerCase() + "://" : ""
                    }${host}`;
                    navigator.clipboard.writeText(url);
                    toast("URL copied to clipboard");
                  }}
                >
                  {`${protocol ? protocol.toLowerCase() + "://" : ""}${host}`}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No host</span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
