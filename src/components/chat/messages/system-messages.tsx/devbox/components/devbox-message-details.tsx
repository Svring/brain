import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useAuthState } from "@/contexts/auth/auth-context";
import { Separator } from "@/components/ui/separator";

interface DevboxInfoDetailsProps {
  devboxObject: DevboxObject;
}

export const DevboxInfoDetails: React.FC<DevboxInfoDetailsProps> = ({
  devboxObject,
}) => {
  const { auth } = useAuthState();
  const namespace = auth?.namespace;
  const regionUrl = auth?.regionUrl;

  return (
    <div className="space-y-4">
      {/* Image Info */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Image:</span>
        <span className="text-sm rounded">{devboxObject.image}</span>
      </div>

      {/* Created At and Up Time Info */}
      {devboxObject.operationalStatus && (
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Created At</span>
            <span className="text-sm font-medium">
              {devboxObject.operationalStatus.createdAt}
            </span>
          </div>
          {devboxObject.operationalStatus.upTime && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="text-sm font-medium">
                {devboxObject.operationalStatus.upTime}
              </span>
            </div>
          )}
        </div>
      )}

      {/* CPU and Memory Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">CPU</span>
          <span className="text-sm font-medium">
            {devboxObject.resources?.cpu
              ? `${devboxObject.resources.cpu}Core`
              : "N/A"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Memory</span>
          <span className="text-sm font-medium">
            {devboxObject.resources?.memory
              ? `${devboxObject.resources.memory}GB`
              : "N/A"}
          </span>
        </div>
      </div>

      <Separator />

      {/* SSH Connection Info */}
      {devboxObject.ssh && (
        <div className="flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                SSH Connection
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
        </div>
      )}
    </div>
  );
};
