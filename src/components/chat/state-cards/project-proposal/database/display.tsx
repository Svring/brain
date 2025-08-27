"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import type { Database as DatabaseType } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface DatabaseDisplayProps {
  resource: DatabaseType;
  onEdit: () => void;
}

export function DatabaseDisplay({ resource, onEdit }: DatabaseDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src={
              CLUSTER_TYPE_ICON_MAP[
                resource.type as keyof typeof CLUSTER_TYPE_ICON_MAP
              ] ||
              "https://dbprovider.bja.sealos.run/logo.svg"
            }
            alt={`${resource.type} Icon`}
            width={36}
            height={36}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            Database
          </span>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {resource.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{resource.type}</Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground pl-1 break-words">
        {resource.description}
      </p>
    </div>
  );
}
