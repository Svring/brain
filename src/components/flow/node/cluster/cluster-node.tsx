"use client";

import BaseNode from "../base-node-wrapper";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/cluster/cluster-constant";
import useClusterNode from "@/hooks/sealos/cluster/use-cluster-node";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { motion } from "framer-motion";
import { useHover } from "@reactuses/core";
import { useRef, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import NodeStatusLight from "../node-components/node-status-light";
import NodeInternalUrl from "../node-components/node-internal-url";
import NodeMonitor from "../node-components/node-monitor";
import NodePods from "../node-components/node-pods";
import ClusterNodeMenu from "./cluster-node-menu";

export default function ClusterNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  const context = createK8sContext();
  const { data, isLoading } = useClusterNode(context, target);

  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  const [publicAccess, setPublicAccess] = useState(false);

  const handleCopyClusterInfo = () => {
    const clusterInfo = `Cluster: ${data.name}\nType: ${data.type}\nStatus: ${data.status}`;
    navigator.clipboard.writeText(clusterInfo);
    toast("Cluster information copied to clipboard");
  };

  if (isLoading || !data) {
    return null;
  }

  console.log("cluster data", data);

  return (
    <div ref={ref} className="relative">
      {/* Background card */}
      <motion.div
        className="absolute inset-0 bg-background-secondary border border-border rounded-xl shadow-sm"
        style={{
          transform: "translate(2px, 2px)",
          zIndex: -1,
        }}
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{
          opacity: 0.6,
          y: hovered ? -25 : -10,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />

      {/* Main card */}
      <motion.div
        initial={{ y: 0 }}
        style={{
          zIndex: 1,
          transform: "translate(0, 0)",
        }}
        animate={{
          y: 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <BaseNode target={target} nodeData={data}>
          <div className="flex h-full flex-col gap-2 justify-between">
            {/* Header with Name and Menu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate font-medium">
                <div className="flex flex-col items-start">
                  <span className="flex items-center gap-2">
                    <Image
                      src={CLUSTER_TYPE_ICON_MAP[data.type] ?? ""}
                      alt={data.type}
                      width={24}
                      height={24}
                      className="rounded-lg h-9 w-9"
                      priority
                    />
                    <span className="flex flex-col">
                      <span className="text-xs text-muted-foreground leading-none">
                        {data.type}
                      </span>
                      <span className="text-lg font-bold text-foreground leading-tight w-full overflow-hidden text-ellipsis text-left">
                        {data.name}
                      </span>
                    </span>
                  </span>
                </div>
              </div>

              {/* Menu */}
              <div className="flex-shrink-0">
                <ClusterNodeMenu />
              </div>
            </div>

            {/* Public Access Toggle and Copy Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Public Access
                </span>
                <Switch
                  checked={publicAccess}
                  onCheckedChange={setPublicAccess}
                  className="scale-75"
                />
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyClusterInfo();
                }}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>

            {/* Bottom section with status and icons */}
            <div className="mt-auto flex justify-between items-center">
              {/* Left: Status light */}
              <NodeStatusLight status={data.status} />

              {/* Right: Icon components */}
              <div className="flex items-center gap-2">
                <NodeInternalUrl ports={[]} />
                <NodePods />
                <NodeMonitor />
              </div>
            </div>
          </div>
        </BaseNode>
      </motion.div>
    </div>
  );
}
