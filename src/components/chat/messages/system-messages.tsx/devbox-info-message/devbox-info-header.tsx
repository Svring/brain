import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import Image from "next/image";
import DevboxNodeIde from "@/components/flowgraph/node/sealos/devbox/devbox-node-ide";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useAuthState } from "@/contexts/auth/auth-context";

interface DevboxInfoHeaderProps {
  devboxData: DevboxObject;
}

export const DevboxInfoHeader: React.FC<DevboxInfoHeaderProps> = ({
  devboxData,
}) => {
  const { auth } = useAuthState();
  const namespace = auth?.namespace;
  const regionUrl = auth?.regionUrl;
  
  return (
    <CardHeader className="">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Image
              src={`https://devbox.${regionUrl}/images/runtime/${
                devboxData.image.split("-")[0]
              }.svg`}
              alt="Devbox Icon"
              width={24}
              height={24}
              className="rounded-lg h-9 w-9 flex-shrink-0"
              priority
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground leading-none">
                Devbox
              </span>
              <span className="text-lg font-bold text-foreground leading-tight truncate">
                {devboxData.name}
              </span>
            </div>
          </div>
        </div>
        <Badge>{devboxData.status}</Badge>
        <DevboxNodeIde object={devboxData} />
      </div>

      {/* Created At and Up Time Info */}
      {devboxData.operationalStatus && (
        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Created At</span>
            <span className="text-sm font-medium">
              {devboxData.operationalStatus.createdAt}
            </span>
          </div>
          {devboxData.operationalStatus.upTime && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Start Time</span>
              <span className="text-sm font-medium">
                {devboxData.operationalStatus.upTime}
              </span>
            </div>
          )}
        </div>
      )}

      {/* SSH Connection Info */}
      {devboxData.ssh && (
        <div className="pt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                SSH Connection
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  if (devboxData.ssh.privateKey) {
                    const fileName = `${regionUrl}_${namespace}_${devboxData.name}`;
                    const blob = new Blob([devboxData.ssh.privateKey], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono py-1 rounded text-foreground">
                ssh -i {regionUrl}_{namespace}_{devboxData.name} {devboxData.ssh.user}@{devboxData.ssh.host} -p{" "}
                {devboxData.ssh.port}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  const sshCommand = `ssh -i ${regionUrl}_${namespace}_${devboxData.name} ${devboxData.ssh.user}@${devboxData.ssh.host} -p ${devboxData.ssh.port}`;
                  navigator.clipboard.writeText(sshCommand);
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </CardHeader>
  );
};
