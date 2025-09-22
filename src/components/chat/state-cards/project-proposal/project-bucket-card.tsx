"use client";

import React, { useState } from "react";
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

// Policy options matching the ObjectStorageBucket schema
const bucketPolicyOptions = [
  "private",
  "publicRead",
  "publicReadwrite",
] as const;

interface ProjectBucketCardProps {
  resource: ObjectStorageBucket;
  onSave?: (updatedResource: ObjectStorageBucket) => void;
}

export function ProjectBucketCard({
  resource,
  onSave,
}: ProjectBucketCardProps) {
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
      <div className="space-y-3 flex-col bg-background-secondary border p-3 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <img
              src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
              alt="Object Storage Icon"
              width={36}
              height={36}
              className="rounded-lg border border-muted h-9 w-9 flex-shrink-0 p-1 bg-muted"
            />
          </div>
          <div className="flex items-center min-w-0 flex-1">
            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="text-lg leading-tight bg-transparent h-9 border border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="pl-1">
          <Select
            value={editData.policy}
            onValueChange={(value) =>
              setEditData({ ...editData, policy: value as any })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select policy" />
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
    );
  }

  return (
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
            alt="Object Storage Icon"
            width={36}
            height={36}
            className="rounded-lg border border-muted h-9 w-9 flex-shrink-0 p-1 bg-muted"
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
          {onSave && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm pl-1 text-muted-foreground">
        Policy: <span className="text-foreground">{resource.policy}</span>
      </div>
    </div>
  );
}
