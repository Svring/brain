"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createObjectStorageContext } from "@/lib/sealos/objectstorage/objectstorage-utils";
import { useCreateObjectStorageAction } from "@/lib/sealos/objectstorage/objectstorage-action/objectstorage-action";
import { useToggle } from "@reactuses/core";
import { toast } from "sonner";

// Remove unused imports

// Remove bucket policy options; default will be private.

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

  // No policy selection needed

  return (
    <div className="space-y-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Create an object storage bucket for file storage:
      </div>

      {/* No parameter inputs - using defaults */}

      <Button className="mt-4 w-full" onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Object Storage"}
      </Button>
    </div>
  );
}
