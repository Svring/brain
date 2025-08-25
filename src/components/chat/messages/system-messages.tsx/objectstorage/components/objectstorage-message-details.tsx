import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Globe, Key, Lock, Unlock } from "lucide-react";
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

  const getPolicyIcon = () => {
    switch (policy) {
      case "private":
        return <Lock className="h-4 w-4" />;
      case "publicRead":
      case "publicReadwrite":
        return <Unlock className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

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

  const getPolicyColor = () => {
    switch (policy) {
      case "private":
        return "bg-red-100 text-red-800 border-red-200";
      case "publicRead":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "publicReadwrite":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      </div>

      {/* Access Information */}
      <Card className="bg-transparent border border-dashed">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Key className="h-4 w-4" />
            Access Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Access Key</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono px-2 py-1 rounded flex-1">
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
                    <Copy className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Secret Key</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono px-2 py-1 rounded flex-1">
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
                    <Copy className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                External Endpoint
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
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
                    <Copy className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                Internal Endpoint
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
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
                    <Copy className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
