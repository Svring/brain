import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, ChevronDown, Terminal } from "lucide-react";
import { DevboxObject, DevboxObjectSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useAuthState } from "@/contexts/auth/auth-context";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  
  // Parse the resource data
  const devboxObject = resource ? DevboxObjectSchema.parse(resource) : null;

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

  return (
    <div className="space-y-4">
      {/* Image Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Image</span>
        <span className="text-sm font-medium truncate flex-1">
          {devboxObject.image}
        </span>
      </div>

      {/* Created At and Up Time Info */}
      {devboxObject.operationalStatus && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium truncate flex-1">
            {devboxObject.operationalStatus.createdAt}
          </span>
        </div>
      )}

      {/* CPU, Memory, and Uptime in a single row with borders */}
      <div className="flex items-center border rounded-lg p-3">
        <div className="flex-1 text-center border-r last:border-r-0">
          <div className="text-sm text-muted-foreground">CPU</div>
          <div className="text-sm font-medium">
            {devboxObject.resources?.cpu
              ? `${devboxObject.resources.cpu}Core`
              : "N/A"}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-muted-foreground">Memory</div>
          <div className="text-sm font-medium">
            {devboxObject.resources?.memory
              ? `${devboxObject.resources.memory}GB`
              : "N/A"}
          </div>
        </div>
      </div>

      {/* SSH Connection Info */}
      {devboxObject.ssh && (
        <Accordion type="multiple" className="w-full space-y-1">
          <AccordionItem
            value="ssh-connection"
            className="inset-ring inset-ring-border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <Terminal className="h-4 w-4" />
                <span className="font-medium">SSH Connection</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    SSH Command
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
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
                    Download Key
                  </Button>
                </div>
                <div className="flex items-center justify-between min-w-0 w-full bg-muted border border-border-primary rounded-md p-1">
                  <span className="text-sm font-mono p-1 rounded text-foreground flex-1 truncate mr-2 min-w-0 max-w-md">
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
                      navigator.clipboard.writeText(sshCommand);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};
