"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import type { DevBox } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface DevBoxDisplayProps {
  resource: DevBox;
  onEdit: () => void;
}

export function DevBoxDisplay({ resource, onEdit }: DevBoxDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src="https://devbox.bja.sealos.run/logo.svg"
            alt="DevBox Icon"
            width={36}
            height={36}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            Development Environment
          </span>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {resource.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{resource.runtime}</Badge>
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
      {resource.reliances && (
        <div className="pl-1">
          <div className="text-sm text-muted-foreground">
            <strong>Dependencies:</strong>
          </div>
          {resource.reliances.database &&
            resource.reliances.database.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                <strong>Database:</strong>{" "}
                {resource.reliances.database.join(", ")}
              </div>
            )}
          {resource.reliances.bucket &&
            resource.reliances.bucket.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                <strong>Object Storage:</strong>{" "}
                {resource.reliances.bucket.join(", ")}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
