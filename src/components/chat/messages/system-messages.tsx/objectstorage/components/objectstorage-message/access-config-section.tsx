"use client";

import React from "react";
import { Key, Copy, Check } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";

interface AccessConfigSectionProps {
  objectstorageObject: ObjectStorageObject;
  onSectionClick: () => void;
}

// Access Configuration Popover Content Component
export const AccessConfigPopoverContent: React.FC<{
  objectstorageObject: ObjectStorageObject;
}> = ({ objectstorageObject }) => {
  const { copyToClipboard, isCopied } = useCopy();
  const { access } = objectstorageObject;

  const CopyButton = ({ value, id }: { value: string; id: string }) => (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 w-6 p-0 flex-shrink-0"
      onClick={() => copyToClipboard(value, id)}
    >
      {isCopied(id) ? (
        <Check className="w-3 h-3 text-theme-green" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </Button>
  );

  return (
    <div className="w-full rounded-lg p-2">
      <div className="space-y-2">
        {/* Access Key and Secret Key in one row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Access Key</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium flex-1 truncate">
                {access.accessKey}
              </span>
              <CopyButton value={access.accessKey} id="access-key" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Secret Key</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium flex-1 truncate">
                {access.secretKey ? "••••••••••••••••" : "N/A"}
              </span>
              <CopyButton value={access.secretKey || "N/A"} id="secret-key" />
            </div>
          </div>
        </div>

        {/* Endpoints */}
        {[
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
        ].map(({ label, value, id }) => (
          <div key={id} className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium flex-1 truncate">
                {value}
              </span>
              <CopyButton value={value} id={id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AccessConfigSection: React.FC<AccessConfigSectionProps> = ({
  objectstorageObject,
  onSectionClick,
}) => {
  const { access } = objectstorageObject;
  const hasAccessKey = !!access.accessKey;
  const hasSecretKey = !!access.secretKey;
  const hasEndpoints = !!(access.external || access.internal);

  const configItems = [
    hasAccessKey && "Access Key",
    hasSecretKey && "Secret Key", 
    hasEndpoints && "Endpoints"
  ].filter(Boolean);

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Access Config</span>
          <span className="text-xs text-muted-foreground">
            {configItems.length} item{configItems.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccessConfigSection;
