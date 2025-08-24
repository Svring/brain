"use client";

import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

interface ObjectStorageUpdatePayload {
  policy?: "private" | "publicRead" | "publicReadWrite";
}

interface ObjectStorageUpdateMessageProps {
  target: CustomResourceTarget;
  payload: ObjectStorageUpdatePayload;
}

export const ObjectStorageUpdateMessage: React.FC<ObjectStorageUpdateMessageProps> = ({
  target,
  payload,
}) => {
  const [currentPolicy, setCurrentPolicy] = useState<"private" | "publicRead" | "publicReadWrite">(payload.policy || "private");
  const { objectstorage } = useTRPCClients();

  const { data: objectstorageObject, isLoading } = useQuery(
    objectstorage.getObjectStorage.queryOptions({
      target,
    })
  );

  const getPolicyDisplayName = (policy: string) => {
    switch (policy) {
      case "private":
        return "Private";
      case "publicRead":
        return "Public Read";
      case "publicReadWrite":
        return "Public Read/Write";
      default:
        return policy;
    }
  };

  const getPolicyBadgeVariant = (policy: string) => {
    switch (policy) {
      case "private":
        return "secondary";
      case "publicRead":
        return "default";
      case "publicReadWrite":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="w-full bg-node-background">
      <CardHeader>
        <CardTitle>Object Storage Bucket Policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading bucket information...</div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Current Policy</Label>
              <div className="flex items-center gap-2">
                <Badge variant={getPolicyBadgeVariant(currentPolicy)}>
                  {getPolicyDisplayName(currentPolicy)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-select">Policy Selection</Label>
              <Select
                value={currentPolicy}
                onValueChange={(value: "private" | "publicRead" | "publicReadWrite") => setCurrentPolicy(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bucket policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="publicRead">Public Read</SelectItem>
                  <SelectItem value="publicReadWrite">Public Read/Write</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Object storage bucket policies can be configured here. Note that policy updates may require 
                additional API support. The current selection reflects the desired policy configuration.
              </AlertDescription>
            </Alert>

            {objectstorageObject && (
              <div className="space-y-2">
                <Label>Bucket Details</Label>
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {target.name}</div>
                  <div><strong>Kind:</strong> {target.plural}</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ObjectStorageUpdateMessage;
