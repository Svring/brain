"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

interface ObjectStorageIconButtonsProps {
  object: ObjectStorageObject;
}

export default function ObjectStorageIconButtons({
  object,
}: ObjectStorageIconButtonsProps) {
  const { name: bucketName } = object;

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* No action buttons for object storage */}
        </div>
      </TooltipProvider>

    </>
  );
}
