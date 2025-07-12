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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BucketPolicy = "private" | "publicRead" | "publicReadWrite";

const BUCKET_POLICIES: {
  value: BucketPolicy;
  label: string;
  description: string;
}[] = [
  {
    value: "private",
    label: "Private",
    description: "Only you can access this bucket",
  },
  {
    value: "publicRead",
    label: "Public Read",
    description: "Anyone can read from this bucket",
  },
  {
    value: "publicReadWrite",
    label: "Public Read/Write",
    description: "Anyone can read and write to this bucket",
  },
];

export default function AddObjectStorage() {
  const { user } = use(AuthContext);
  const [bucketName, setBucketName] = useState("");
  const [bucketPolicy, setBucketPolicy] = useState<BucketPolicy>("private");
  const [created, setCreated] = useState<string | null>(null);

  // Create the context and mutation hook
  const objectStorageContext = createObjectStorageContext();
  const createObjectStorageMutation =
    useCreateObjectStorageMutation(objectStorageContext);

  const handleCreate = () => {
    if (!bucketName) return;

    const request: ObjectStorageCreateRequest = {
      bucketName: bucketName || generateObjectStorageName(),
      bucketPolicy,
    };

    createObjectStorageMutation.mutate(request, {
      onSuccess: () => {
        setCreated(bucketName);
      },
      onError: (error) => {
        console.error("Failed to create object storage:", error);
      },
    });
  };

  const selectedPolicy = BUCKET_POLICIES.find((p) => p.value === bucketPolicy);

  return (
    <div className="space-y-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Create an object storage bucket for file storage:
      </div>

      {/* Bucket Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="bucket-name" className="text-xs font-medium">
          Bucket Name
        </Label>
        <Input
          id="bucket-name"
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          placeholder="Enter bucket name"
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Bucket names must be unique and follow naming conventions
        </p>
      </div>

      {/* Bucket Policy */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium">Access Policy</Label>
        <Select
          value={bucketPolicy}
          onValueChange={(value: BucketPolicy) => setBucketPolicy(value)}
        >
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select access policy" />
          </SelectTrigger>
          <SelectContent>
            {BUCKET_POLICIES.map((policy) => (
              <SelectItem key={policy.value} value={policy.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{policy.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {policy.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPolicy && (
          <p className="text-xs text-muted-foreground">
            {selectedPolicy.description}
          </p>
        )}
      </div>

      {/* Security Notice */}
      {bucketPolicy !== "private" && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-yellow-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-yellow-700">
                <strong>Security Warning:</strong> This bucket will be publicly
                accessible. Make sure you understand the security implications.
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        className="mt-4 w-full"
        onClick={handleCreate}
        disabled={
          createObjectStorageMutation.isPending ||
          !bucketName ||
          created === bucketName
        }
      >
        {created === bucketName
          ? "Created"
          : createObjectStorageMutation.isPending
          ? "Creating..."
          : "Create Object Storage"}
      </Button>
    </div>
  );
}
