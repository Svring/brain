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
import { Save, X } from "lucide-react";
import type { ObjectStorageBucket } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

// Import policy options from object storage create message
import { bucketPolicyOptions } from "@/components/chat/messages/system-messages.tsx/objectstorage/objectstorage-create-message";

interface BucketEditProps {
  resource: ObjectStorageBucket;
  onSave: (updatedResource: ObjectStorageBucket) => void;
  onCancel: () => void;
}

export function BucketEdit({ resource, onSave, onCancel }: BucketEditProps) {
  const [editData, setEditData] = useState(resource);

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="space-y-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-orange-800">Edit Object Storage</h5>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-orange-700">Name</label>
          <Input
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-orange-700">
            Policy
          </label>
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
      <div>
        <label className="text-sm font-medium text-orange-700">
          Description
        </label>
        <Textarea
          value={editData.description}
          onChange={(e) =>
            setEditData({ ...editData, description: e.target.value })
          }
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  );
}
