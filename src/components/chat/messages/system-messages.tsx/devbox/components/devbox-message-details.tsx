import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  ChevronDown,
  Terminal,
  PenLine,
  Check,
  Cpu,
  MemoryStick,
  X,
} from "lucide-react";
import {
  DevboxObject,
  DevboxObjectSchema,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useAuthState } from "@/contexts/auth/auth-context";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { Separator } from "@/components/ui/separator";
import { useCopy } from "@/hooks/use-copy";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";

interface DevboxInfoDetailsProps {
  target: CustomResourceTarget;
}

export const DevboxInfoDetails: React.FC<DevboxInfoDetailsProps> = ({
  target,
}) => {
  const { auth } = useAuthState();
  const namespace = auth?.namespace;
  const regionUrl = auth?.regionUrl;

  const { resource, isLoading, error } = useResourceStatus(target);
  const { copyToClipboard, isCopied } = useCopy();

  // State for resource edit mode
  const [isResourceEditing, setIsResourceEditing] = useState(false);

  // Parse the resource data
  const devboxObject = resource ? DevboxObjectSchema.parse(resource) : null;

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

  const handleResourceSubmit = async (data: DevboxUpdateFormData) => {
    // Only extract the resource field from the form data
    const resourceData = data.resource;
    if (resourceData) {
      // TODO: Implement save functionality
      console.log("Saving resource configuration:", resourceData);
    }
    setIsResourceEditing(false);
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
      <div className="border border-dashed rounded-lg">
        <div className="flex items-center justify-between p-2 border-b border-dashed">
          <h3 className="font-medium">Resource Quota</h3>
          {isResourceEditing ? (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8"
                onClick={() => setIsResourceEditing(false)}
              >
                <X />
              </Button>
              <Button
                type="submit"
                form="devbox-update-form"
                variant="outline"
                size="sm"
                className="h-8 w-8"
              >
                <Check />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsResourceEditing(true)}
            >
              <PenLine />
            </Button>
          )}
        </div>
        <div className={`${isResourceEditing ? "p-4" : "p-2"}`}>
          {isResourceEditing ? (
            <DevboxUpdateForm
              defaultValues={{
                resource: {
                  cpu: devboxObject.resources?.cpu?.toString() || "2",
                  memory: devboxObject.resources?.memory?.toString() || "4",
                },
              }}
              onSubmit={handleResourceSubmit}
              isLoading={false}
              hideDefaultButton={true}
            />
          ) : (
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">CPU</div>
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {devboxObject.resources?.cpu
                    ? `${devboxObject.resources.cpu}Core`
                    : "N/A"}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Memory</div>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {devboxObject.resources?.memory
                    ? `${devboxObject.resources.memory}GB`
                    : "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                className="flex-1 h-8 text-xs"
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
                <Download className="h-3 w-3 mr-1" />
                Private Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                <Terminal className="h-3 w-3 mr-1" />
                SSH Connection Setup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
