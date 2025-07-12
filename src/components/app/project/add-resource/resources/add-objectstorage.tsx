"use client";

import { use, useState } from "react";
import type { ObjectStorageCreateRequest } from "@/lib/sealos/objectstorage/schemas/req-res-schemas/req-res-create-schemas";
import { Button } from "@/components/ui/button";
import {
  createObjectStorageContext,
  generateObjectStorageName,
} from "@/lib/sealos/objectstorage/objectstorage-utils";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useCreateObjectStorageMutation } from "@/lib/sealos/objectstorage/objectstorage-mutation";

// Remove unused imports

// Remove bucket policy options; default will be private.

export default function AddObjectStorage() {
  const { user } = use(AuthContext);
  const [created, setCreated] = useState<boolean>(false);

  // Create the context and mutation hook
  const objectStorageContext = createObjectStorageContext();
  const createObjectStorageMutation =
    useCreateObjectStorageMutation(objectStorageContext);

  const handleCreate = () => {
    // No parameter inputs - using defaults
    const request: ObjectStorageCreateRequest = {
      bucketName: generateObjectStorageName(),
      bucketPolicy: "private",
    };

    createObjectStorageMutation.mutate(request, {
      onSuccess: () => {
        setCreated(true);
      },
      onError: (error) => {
        console.error("Failed to create object storage:", error);
      },
    });
  };

  // No policy selection needed

  return (
    <div className="space-y-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Create an object storage bucket for file storage:
      </div>

      {/* No parameter inputs - using defaults */}

      <Button
        className="mt-4 w-full"
        onClick={handleCreate}
        disabled={createObjectStorageMutation.isPending || created}
      >
        {created
          ? "Created"
          : createObjectStorageMutation.isPending
          ? "Creating..."
          : "Create Object Storage"}
      </Button>
    </div>
  );
}
