import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, ChevronDown, Terminal, Check } from "lucide-react";
import {
  DevboxObject,
  DevboxObjectSchema,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useAuthState } from "@/contexts/auth/auth-context";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { Separator } from "@/components/ui/separator";
import { useCopy } from "@/hooks/use-copy";
import { ResourceQuota } from "./devbox-message-detail/devbox-resource";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";

interface DevboxInfoDetailsProps {
  target: CustomResourceTarget;
}

export const DevboxMessageDetail: React.FC<DevboxInfoDetailsProps> = ({
  target,
}) => {
  const { auth } = useAuthState();
  const { devbox } = useTRPCClients();
  const queryClient = useQueryClient();
  const namespace = auth?.namespace;
  const regionUrl = auth?.regionUrl;

  const { resource, isLoading, error } = useResourceStatus(target);
  const { copyToClipboard, isCopied } = useCopy();

  // Parse the resource data
  const devboxObject = resource ? DevboxObjectSchema.parse(resource) : null;

  // Update devbox mutation
  const updateDevboxMutation = useMutation({
    ...devbox.updateDevbox.mutationOptions(),
    onSuccess: () => {
      // Invalidate and refetch devbox data
      queryClient.invalidateQueries({
        queryKey: devbox.getDevbox.queryKey(target),
      });
      toast.success("Devbox updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update devbox");
    },
  });

  // console.log("devboxObject", devboxObject);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Loading devbox information...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !devboxObject) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-red-600 font-medium">
            Failed to load devbox information
          </div>
        </div>
      </div>
    );
  }

  const handleResourceSubmit = async (
    type: string,
    data: DevboxUpdateFormData
  ) => {
    try {
      console.log("Saving resource configuration:", data);

      await updateDevboxMutation.mutateAsync({
        devboxName: devboxObject.name,
        request: data,
      });
    } catch (error) {
      console.error("Error updating devbox:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Runtime</span>
        <span className="text-sm font-medium truncate flex-1">
          {transformDevboxImage(devboxObject.image)}
        </span>
      </div>

      {/* Created At and Up Time Info */}
      {devboxObject.operationalStatus && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-muted-foreground">Created At</span>
            <span className="text-sm font-medium truncate">
              {devboxObject.operationalStatus.createdAt}
            </span>
          </div>
          {devboxObject.operationalStatus.upTime && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="text-sm font-medium">
                {devboxObject.operationalStatus.upTime}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Resource Quota Section */}
      <ResourceQuota
        resource={devboxObject.resources}
        onResourceUpdate={handleResourceSubmit}
        isLoading={false}
      />

      <Separator />

      {/* SSH Connection Info */}
      {devboxObject.ssh && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              SSH Connection
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between min-w-0 w-full bg-muted border border-border-primary rounded-md p-2">
              <span className="text-xs font-mono rounded text-foreground flex-1 truncate mr-2 min-w-0 max-w-md">
                ssh -i {regionUrl}_{namespace}_{devboxObject.name}{" "}
                {devboxObject.ssh.user}@{devboxObject.ssh.host} -p{" "}
                {devboxObject.ssh.port}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => {
                  const sshCommand = `ssh -i ${regionUrl}_${namespace}_${devboxObject.name} ${devboxObject.ssh.user}@${devboxObject.ssh.host} -p ${devboxObject.ssh.port}`;
                  copyToClipboard(sshCommand, "ssh-command");
                }}
              >
                {isCopied("ssh-command") ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs min-w-0"
                onClick={() => {
                  if (devboxObject.ssh.privateKey) {
                    const fileName = `${regionUrl}_${namespace}_${devboxObject.name}`;
                    const blob = new Blob([devboxObject.ssh.privateKey], {
                      type: "text/plain",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                <Download className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Private Key</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs min-w-0"
              >
                <Terminal className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">SSH Connection Setup</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
