"use client";

import React from "react";
import Image from "next/image";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";

interface MessageHeaderProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
  regionUrl?: string;
}

export default function MessageHeader({
  target,
  regionUrl,
}: MessageHeaderProps) {
  const getIconUrl = () => {
    switch (target.resourceType) {
      case "devbox":
        return "https://devbox.bja.sealos.run/logo.svg";

      case "cluster":
        return (
          CLUSTER_TYPE_ICON_MAP[
            target.name as keyof typeof CLUSTER_TYPE_ICON_MAP
          ] || "https://dbprovider.bja.sealos.run/logo.svg"
        );

      case "deployment":
      case "statefulset":
        return "https://applaunchpad.bja.sealos.run/logo.svg";

      default:
        return "https://sealos.run/logo.svg";
    }
  };

  const getResourceTypeLabel = () => {
    switch (target.resourceType) {
      case "devbox":
        return "Devbox";
      case "cluster":
        return "Database";
      case "deployment":
      case "statefulset":
        return "App Launchpad";
      default:
        return (
          target.resourceType.charAt(0).toUpperCase() +
          target.resourceType.slice(1)
        );
    }
  };

  const getDisplayName = () => {
    const name = target.name || "Unknown";
    const maxLength = 15;
    return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
  };

  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <Image
            src={getIconUrl()}
            alt={`${target.resourceType} Icon`}
            width={24}
            height={24}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              {getResourceTypeLabel()}
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {getDisplayName()}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
