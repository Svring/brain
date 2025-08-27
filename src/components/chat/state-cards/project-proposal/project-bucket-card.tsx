"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Save, X } from "lucide-react";
import Image from "next/image";
import type { ObjectStorageBucket } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

// Import policy options from object storage create message
import { bucketPolicyOptions } from "@/components/chat/messages/system-messages.tsx/objectstorage/objectstorage-create-message";

interface ProjectBucketCardProps {
  resource: ObjectStorageBucket;
  onSave?: (updatedResource: ObjectStorageBucket) => void;
}

export function ProjectBucketCard({ resource, onSave }: ProjectBucketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(resource);

  const handleSave = () => {
    if (onSave) {
      onSave(editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(resource);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-background">
        <div className="flex items-center justify-between">
          <h5 className="font-medium">Edit Object Storage</h5>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Policy</label>
            <Select
              value={editData.policy}
              onValueChange={(value) =>
                setEditData({ ...editData, policy: value as any })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bucketPolicyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
            alt="Object Storage Icon"
            width={36}
            height={36}
            className="rounded-lg border border-muted h-9 w-9 flex-shrink-0"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            Object Storage
          </span>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {resource.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{resource.policy}</Badge>
          {onSave && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
