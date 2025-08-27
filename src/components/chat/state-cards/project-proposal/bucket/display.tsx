"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import type { ObjectStorageBucket } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface BucketDisplayProps {
  resource: ObjectStorageBucket;
  onEdit: () => void;
}

export function BucketDisplay({ resource, onEdit }: BucketDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
            alt="Object Storage Icon"
            width={36}
            height={36}
            className="rounded-lg border border-muted h-9 w-9 flex-shrink-0"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            Object Storage
          </span>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {resource.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{resource.policy}</Badge>
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
