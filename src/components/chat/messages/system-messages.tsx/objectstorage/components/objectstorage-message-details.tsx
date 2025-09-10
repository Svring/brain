import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Key, Check, Pencil, X } from "lucide-react";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { useCopy } from "@/hooks/use-copy";
import { ObjectStorageUpdateForm } from "@/components/forms/objectstorage/objectstorage-update-form";
import { ObjectStorageUpdateFormData } from "@/schemas/forms/objectstorage/objectstorage-update-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Spinner } from "@/components/ui/spinner";

interface ObjectStorageMessageDetailsProps {
  objectstorageObject?: ObjectStorageObject;
  target: CustomResourceTarget;
}

export default function ObjectStorageMessageDetails({
  objectstorageObject,
  target,
}: ObjectStorageMessageDetailsProps) {
  const { copyToClipboard, isCopied } = useCopy();
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

  if (!objectstorageObject) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No object storage information available
      </div>
    );
  }

  const { name, displayName, policy, access } = objectstorageObject;

  const getPolicyLabel = () => {
    const labels: Record<string, string> = {
      private: "Private",
      publicRead: "Public Read",
      publicReadwrite: "Public Read/Write",
    };
    return labels[policy] || policy;
  };

  const CopyButton = ({ value, id }: { value: string; id: string }) => (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 w-6 p-0 flex-shrink-0"
      onClick={() => copyToClipboard(value, id)}
    >
      {isCopied(id) ? (
        <Check className="w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Name</span>
            <p className="text-sm font-medium">{name}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Display Name</span>
            <p className="text-sm font-medium">{displayName}</p>
          </div>
        </div>

        {/* Policy Information */}
        <div className="border rounded-lg p-3 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Policy</span>
              {!isPolicyEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsPolicyEditing(true)}
                  disabled={isUpdating}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              )}
            </div>
            {isPolicyEditing && (
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
            )}
          </div>
          {isPolicyEditing ? (
            <ObjectStorageUpdateForm
              defaultValues={{
                policy: policy as
                  | "private"
                  | "publicRead"
                  | "publicReadwrite",
              }}
              onSubmit={handlePolicySubmit}
              isLoading={isUpdating}
              hideDefaultButton
            />
          ) : (
            <p className="text-sm font-medium">{getPolicyLabel()}</p>
          )}
        </div>
      </div>

      {/* Access Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          <span className="text-base font-medium">Access Configuration</span>
        </div>

        <div className="space-y-3">
          {[
            { label: "Access Key", value: access.accessKey, id: "access-key" },
            {
              label: "Secret Key",
              value: access.secretKey || "N/A",
              id: "secret-key",
              display: access.secretKey ? "••••••••••••••••" : "N/A",
            },
            {
              label: "External Endpoint",
              value: access.external,
              id: "external-endpoint",
            },
            {
              label: "Internal Endpoint",
              value: access.internal,
              id: "internal-endpoint",
            },
          ].map(({ label, value, id, display }) => (
            <div key={id} className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium flex-1 truncate">
                  {display || value}
                </span>
                <CopyButton value={value} id={id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
