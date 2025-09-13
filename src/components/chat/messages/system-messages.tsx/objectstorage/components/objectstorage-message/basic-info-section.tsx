"use client";

import React from "react";
import { Calendar, Database } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

interface BasicInfoSectionProps {
  objectstorageObject: ObjectStorageObject;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  objectstorageObject,
}) => {
  const { name, displayName } = objectstorageObject;

  return (
    <div className="p-2 border rounded-lg">
      <div className="flex gap-4">
        {/* Name */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Name</span>
          <span className="text-xs text-muted-foreground truncate">
            {name || "Unknown"}
          </span>
        </div>

        {/* Display Name */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Display Name</span>
          <span className="text-xs text-muted-foreground truncate">
            {displayName || "Unknown"}
          </span>
        </div>

        {/* Type */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Type</span>
          <span className="text-xs text-muted-foreground truncate">
            Object Storage
          </span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
