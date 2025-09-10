"use client";

import React from "react";
import Image from "next/image";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { DEVBOX_RUNTIME_ICONS } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";

interface BaseResourceIconProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
  size?: number;
  className?: string;
}

export default function BaseResourceIcon({
  target,
  size = 24,
  className = "",
}: BaseResourceIconProps) {
  const { resource } = useResourceStatus(target);

  const getIconUrl = () => {
    switch (target.resourceType) {
      case "devbox":
        // Use runtime from resource data to match against DEVBOX_RUNTIME_ICONS
        if (
          resource &&
          "runtime" in resource &&
          resource.runtime &&
          DEVBOX_RUNTIME_ICONS[
            resource.runtime as keyof typeof DEVBOX_RUNTIME_ICONS
          ]
        ) {
          return DEVBOX_RUNTIME_ICONS[
            resource.runtime as keyof typeof DEVBOX_RUNTIME_ICONS
          ];
        }
        return "https://devbox.bja.sealos.run/logo.svg";

      case "cluster":
        // Use type from resource data to match against CLUSTER_TYPE_ICON_MAP
        if (
          resource &&
          "type" in resource &&
          resource.type &&
          CLUSTER_TYPE_ICON_MAP[resource.type]
        ) {
          return CLUSTER_TYPE_ICON_MAP[resource.type];
        }
        // Fallback to name-based lookup if type is not available
        return (
          CLUSTER_TYPE_ICON_MAP[
            target.name as keyof typeof CLUSTER_TYPE_ICON_MAP
          ] || "https://dbprovider.bja.sealos.run/logo.svg"
        );

      case "deployment":
      case "statefulset":
        return "https://applaunchpad.bja.sealos.run/logo.svg";

      case "objectstoragebucket":
        return "https://objectstorage.bja.sealos.run/logo.svg";

      default:
        return "https://sealos.run/logo.svg";
    }
  };

  return (
    <Image
      src={getIconUrl()}
      alt={`${target.resourceType} Icon`}
      width={size}
      height={size}
      className={`rounded-lg flex-shrink-0 p-1 bg-background-tertiary ${className}`}
      priority
    />
  );
}
