"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useCreateObjectStorageAction } from "@/lib/sealos/resources/objectstorage/objectstorage-action/objectstorage-action";
import { createObjectStorageContext } from "@/lib/sealos/resources/objectstorage/objectstorage-utils";
import { toast } from "sonner";

interface ObjectStorageCreatePayload {
  name?: string;
  policy?: "private" | "publicRead" | "publicReadWrite";
}

interface ObjectStorageCreateMessageProps {
  payload: ObjectStorageCreatePayload;
}

export const ObjectStorageCreateMessage: React.FC<ObjectStorageCreateMessageProps> = ({
  payload,
}) => {
  const [name, setName] = useState(payload.name || "");
  const [policy, setPolicy] = useState<"private" | "publicRead" | "publicReadWrite">(payload.policy || "private");
  const [isCreating, setIsCreating] = useState(false);

  const objectStorageContext = createObjectStorageContext();
  const createObjectStorage = useCreateObjectStorageAction(objectStorageContext);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Bucket name is required");
      return;
    }

    setIsCreating(true);
    try {
      await createObjectStorage.mutateAsync({
        bucketName: name.trim(),
        bucketPolicy: policy,
      });
      toast.success("Object storage bucket created successfully");
    } catch (error) {
      console.error("Failed to create object storage:", error);
      toast.error("Failed to create object storage bucket");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full bg-node-background">
      <CardHeader>
        <CardTitle>Create Object Storage Bucket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bucket-name">Bucket Name</Label>
          <Input
            id="bucket-name"
            placeholder="Enter bucket name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bucket-policy">Bucket Policy</Label>
          <Select
            value={policy}
            onValueChange={(value: "private" | "publicRead" | "publicReadWrite") => setPolicy(value)}
            disabled={isCreating}
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

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleCreate} 
            className="flex-1"
            disabled={isCreating || !name.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Bucket"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectStorageCreateMessage;
