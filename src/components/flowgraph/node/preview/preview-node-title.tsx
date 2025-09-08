"use client";

import React from "react";
import Image from "next/image";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";

interface PreviewNodeTitleProps {
  name: string;
  target: ResourceTarget;
  regionUrl?: string;
}

export default function PreviewNodeTitle({
  name,
  target,
  regionUrl = "bja.sealos.run",
}: PreviewNodeTitleProps) {
  const getIconAndType = () => {
    const defaultIcon = getResourceDefaultIcon(target.resourceType);
    
    if (target.type === "builtin") {
      switch (target.resourceType) {
        case "deployment":
        case "statefulset":
          return {
            icon: defaultIcon || "https://applaunchpad.bja.sealos.run/logo.svg",
            type: "App",
          };
        default:
          return {
            icon: defaultIcon || "https://applaunchpad.bja.sealos.run/logo.svg",
            type: target.resourceType,
          };
      }
    } else if (target.type === "custom") {
      switch (target.resourceType) {
        case "devbox":
          return {
            icon: defaultIcon || "https://devbox.bja.sealos.run/logo.svg",
            type: "DevBox",
          };
        case "cluster":
          return {
            icon: defaultIcon || "https://dbprovider.bja.sealos.run/logo.svg",
            type: "Database",
          };
        case "objectstoragebucket":
          return {
            icon: defaultIcon || "https://objectstorage.bja.sealos.run/logo.svg",
            type: "Storage",
          };
        default:
          return {
            icon: defaultIcon || "https://applaunchpad.bja.sealos.run/logo.svg",
            type: target.resourceType,
          };
      }
    }
    
    return {
      icon: defaultIcon || "https://applaunchpad.bja.sealos.run/logo.svg",
      type: "Resource",
    };
  };

  const { icon, type } = getIconAndType();

  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-2">
          <Image
            src={icon}
            alt={`${type} Icon`}
            width={16}
            height={16}
            className="rounded h-6 w-6 flex-shrink-0 p-0.5 bg-muted"
            priority
          />
          <span className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted-foreground leading-none">
              {type}
            </span>
            <span className="text-xs font-bold text-foreground leading-tight truncate">
              {name.length > 8 ? `${name.slice(0, 8)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
