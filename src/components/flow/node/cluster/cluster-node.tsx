"use client";

import BaseNode from "../base-node-wrapper";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/cluster/cluster-constant";
import useClusterNode from "@/hooks/sealos/cluster/use-cluster-node";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { motion } from "framer-motion";
import { useHover } from "@reactuses/core";
import { useRef, useState } from "react";

export default function ClusterNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  const context = createK8sContext();
  const { data, isLoading } = useClusterNode(context, target);

  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  const [isBackgroundInFront, setIsBackgroundInFront] = useState(false);

  if (isLoading) {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      {/* Background card */}
      <motion.div
        className="absolute inset-0 bg-background-secondary border border-border rounded-xl shadow-sm cursor-pointer hover:brightness-120"
        style={{
          transform: "translate(2px, 2px)",
          zIndex: isBackgroundInFront ? 1 : -1,
        }}
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{
          opacity: isBackgroundInFront ? 1 : 0.6,
          y: isBackgroundInFront ? 0 : hovered ? -25 : -10,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={() => setIsBackgroundInFront(!isBackgroundInFront)}
      />

      {/* Main card */}
      <motion.div
        className={isBackgroundInFront ? "cursor-pointer" : ""}
        initial={{ y: 0 }}
        style={{
          zIndex: isBackgroundInFront ? -1 : 1,
          transform: isBackgroundInFront
            ? "translate(2px, 2px)"
            : "translate(0, 0)",
        }}
        animate={{
          y: isBackgroundInFront ? (hovered ? -25 : -10) : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={
          isBackgroundInFront
            ? () => setIsBackgroundInFront(!isBackgroundInFront)
            : undefined
        }
      >
        <BaseNode target={target} nodeData={data} active={!isBackgroundInFront}>
          <div className="flex h-full flex-col justify-between">
            {/* Name */}
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

            {/* State badge */}
            <div className="mt-auto flex justify-start">
              <Badge
                variant="outline"
                className={
                  typeof data.status === "string" &&
                  data.status.toLowerCase() === "running"
                    ? "border-green-600 text-green-700"
                    : ""
                }
              >
                {data.status}
              </Badge>
            </div>
          </div>
        </BaseNode>
      </motion.div>
    </div>
  );
}
