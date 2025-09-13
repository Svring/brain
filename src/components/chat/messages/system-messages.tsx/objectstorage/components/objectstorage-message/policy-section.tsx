"use client";

import React from "react";
import { Shield } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { ObjectStorageUpdateForm } from "@/components/forms/objectstorage/objectstorage-update-form";
import { ObjectStorageUpdateFormData } from "@/schemas/forms/objectstorage/objectstorage-update-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface PolicySectionProps {
  objectstorageObject: ObjectStorageObject;
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Policy Popover Content Component
export const PolicyPopoverContent: React.FC<{
  objectstorageObject: ObjectStorageObject;
  target: CustomResourceTarget;
}> = ({ objectstorageObject, target }) => {
  const { objectstorage } = useTRPCClients();
  const queryClient = useQueryClient();
  const [isPolicyEditing, setIsPolicyEditing] = useState(false);

  const { mutateAsync: updateObjectStorage, isPending: isUpdating } =
    useMutation({
      ...objectstorage.create.mutationOptions(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: objectstorage.get.queryKey(target),
        });
        setIsPolicyEditing(false);
      },
      onError: (error) =>
        console.error("Failed to update object storage policy:", error),
    });

  const handlePolicySubmit = async (data: ObjectStorageUpdateFormData) => {
    if (!data.policy) return;
    await updateObjectStorage({
      bucketName: target.name || "",
      bucketPolicy: data.policy as "private" | "publicRead" | "publicReadwrite",
    });
  };

  const getPolicyLabel = () => {
    const labels: Record<string, string> = {
      private: "Private",
      publicRead: "Public Read",
      publicReadwrite: "Public Read/Write",
    };
    return labels[objectstorageObject.policy] || objectstorageObject.policy;
  };

  return (
    <div className="w-full rounded-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Storage Policy</h3>
          {isPolicyEditing ? (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8"
                onClick={() => setIsPolicyEditing(false)}
                disabled={isUpdating}
              >
                <X />
              </Button>
              <Button
                type="submit"
                form="objectstorage-update-form"
                variant="outline"
                size="sm"
                className="h-8 w-8"
              >
                {isUpdating ? (
                  <Spinner variant="bars" className="h-4 w-4" />
                ) : (
                  <Check />
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsPolicyEditing(true)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Spinner variant="bars" className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {isPolicyEditing ? (
          <ObjectStorageUpdateForm
            defaultValues={{
              policy: objectstorageObject.policy as
                | "private"
                | "publicRead"
                | "publicReadwrite",
            }}
            onSubmit={handlePolicySubmit}
            isLoading={isUpdating}
            hideDefaultButton
          />
        ) : (
          <div className="p-3 bg-background-tertiary rounded-lg border">
            <p className="text-sm font-medium">{getPolicyLabel()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PolicySection: React.FC<PolicySectionProps> = ({
  objectstorageObject,
  target,
  onSectionClick,
}) => {
  const getPolicyLabel = () => {
    const labels: Record<string, string> = {
      private: "Private",
      publicRead: "Public Read",
      publicReadwrite: "Public Read/Write",
    };
    return labels[objectstorageObject.policy] || objectstorageObject.policy;
  };

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Policy</span>
          <span className="text-xs text-muted-foreground">
            {getPolicyLabel()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PolicySection;
