import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Key, Check } from "lucide-react";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { useCopy } from "@/hooks/use-copy";

interface ObjectStorageMessageDetailsProps {
  objectstorageObject?: ObjectStorageObject;
}

export default function ObjectStorageMessageDetails({
  objectstorageObject,
}: ObjectStorageMessageDetailsProps) {
  const { copyToClipboard, isCopied } = useCopy();

  if (!objectstorageObject) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No object storage information available
        </p>
      </div>
    );
  }

  const { name, displayName, policy, access } = objectstorageObject;

  const getPolicyLabel = () => {
    switch (policy) {
      case "private":
        return "Private";
      case "publicRead":
        return "Public Read";
      case "publicReadwrite":
        return "Public Read/Write";
      default:
        return policy;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Display Name</span>
            <span className="text-sm font-medium">{displayName}</span>
          </div>
        </div>
        
        {/* Policy Information */}
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Policy</span>
          <span className="text-sm font-medium">{getPolicyLabel()}</span>
        </div>
      </div>

      {/* Access Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          <span className="text-base font-medium">Access Configuration</span>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Access Key</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium flex-1 truncate">
                  {access.accessKey}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() =>
                    copyToClipboard(access.accessKey, "access-key")
                  }
                >
                  {isCopied("access-key") ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Secret Key</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium flex-1">
                  {access.secretKey ? "••••••••••••••••" : "N/A"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() =>
                    copyToClipboard(access.secretKey, "secret-key")
                  }
                >
                  {isCopied("secret-key") ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">External Endpoint</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium flex-1 truncate">
                {access.external}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() =>
                  copyToClipboard(access.external, "external-endpoint")
                }
              >
                {isCopied("external-endpoint") ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Internal Endpoint</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium flex-1 truncate">
                {access.internal}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() =>
                  copyToClipboard(access.internal, "internal-endpoint")
                }
              >
                {isCopied("internal-endpoint") ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
