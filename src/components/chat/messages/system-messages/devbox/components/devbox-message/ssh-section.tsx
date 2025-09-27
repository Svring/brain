"use client";

import React from "react";
import { Terminal, Copy, Download, Check } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useCopy } from "@/hooks/use-copy";
import { DevboxObjectSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { Button } from "@/components/ui/button";

interface SshSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// SSH Popover Content Component
export const SshPopoverContent: React.FC<{ target: CustomResourceTarget }> = ({
  target,
}) => {
  const { auth } = useAuthState();
  const { copyToClipboard, isCopied } = useCopy();
  const { resource: devboxResource } = useResourceStatus(target);

  const namespace = auth?.namespace;
  const regionUrl = auth?.regionUrl;
  const parsedDevboxObject = devboxResource
    ? DevboxObjectSchema.parse(devboxResource)
    : null;

  if (!parsedDevboxObject?.ssh) {
    return (
      <div className="bg-background-tertiary rounded-lg">
        <p className="text-sm text-muted-foreground">
          SSH connection information not available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between min-w-0 w-full rounded-lg p-1 px-2 bg-background-tertiary border border-border-primary">
          <span className="text-sm font-mono text-foreground flex-1 truncate mr-2">
            ssh -i {regionUrl}_{namespace}_{parsedDevboxObject.name}{" "}
            {parsedDevboxObject.ssh.user}@{parsedDevboxObject.ssh.host} -p{" "}
            {parsedDevboxObject.ssh.port}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={() => {
              const sshCommand = `ssh -i ${regionUrl}_${namespace}_${parsedDevboxObject.name} ${parsedDevboxObject.ssh.user}@${parsedDevboxObject.ssh.host} -p ${parsedDevboxObject.ssh.port}`;
              copyToClipboard(sshCommand, "ssh-command");
            }}
          >
            {isCopied("ssh-command") ? (
              <Check className="h-4 w-4 text-theme-green" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-sm"
            onClick={() => {
              if (parsedDevboxObject.ssh.privateKey) {
                const fileName = `${regionUrl}_${namespace}_${parsedDevboxObject.name}`;
                const blob = new Blob([parsedDevboxObject.ssh.privateKey], {
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
            <Download className="h-4 w-4 mr-2" />
            Private Key
          </Button>
          {/* <Button variant="outline" size="sm" className="flex-1 text-sm">
            <Terminal className="h-4 w-4 mr-2" />
            SSH Setup
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export const SshSection: React.FC<SshSectionProps> = ({
  target,
  onSectionClick,
}) => {
  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors w-full min-w-0"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Terminal className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">SSH</span>
          <span className="text-xs text-muted-foreground">Details</span>
        </div>
      </div>
    </div>
  );
};

export default SshSection;
