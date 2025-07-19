"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createObjectStorageContext } from "@/lib/sealos/objectstorage/objectstorage-utils";
import { useCreateObjectStorageAction } from "@/lib/sealos/objectstorage/objectstorage-action/objectstorage-action";
import { useToggle } from "@reactuses/core";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { HardDrive } from "lucide-react";

export default function AddObjectStorage() {
  const [loading, toggleLoading] = useToggle(false);

  // Create the context and mutation hook
  const objectStorageContext = createObjectStorageContext();
  const createObjectStorageAction =
    useCreateObjectStorageAction(objectStorageContext);

  const handleCreate = () => {
    toggleLoading(true);
    createObjectStorageAction.mutate(
      {}, // Use all defaults
      {
        onSuccess: () => {
          toggleLoading(false);
          toast.success("Object storage created successfully");
        },
        onError: (error: unknown) => {
          console.error("Failed to create object storage:", error);
          toggleLoading(false);
          toast.error("Failed to create object storage");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
          <HardDrive className="w-8 h-8 text-muted-foreground" />
          <div className="flex-1">
            <Label className="text-sm font-medium">Object Storage Bucket</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Create a private S3-compatible storage bucket for file storage and
              management.
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Bucket name will be auto-generated</p>
          <p>• Default policy: Private access</p>
          <p>• S3-compatible API endpoint included</p>
        </div>
      </div>

      <div className="pt-2 border-t">
        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={loading}
          size="sm"
        >
          {loading ? "Creating..." : "Create Object Storage"}
        </Button>
      </div>
    </div>
  );
}
