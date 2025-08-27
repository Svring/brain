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
import type { Database as DatabaseType } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

// Import database type options from cluster create message
import { clusterTypeOptions } from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";

interface DatabaseEditProps {
  resource: DatabaseType;
  onSave: (updatedResource: DatabaseType) => void;
  onCancel: () => void;
}

export function DatabaseEdit({ resource, onSave, onCancel }: DatabaseEditProps) {
  const [editData, setEditData] = useState(resource);

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-green-800">Edit Database</h5>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
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
          <label className="text-sm font-medium text-green-700">Name</label>
          <Input
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-green-700">Type</label>
          <Select
            value={editData.type}
            onValueChange={(value) =>
              setEditData({ ...editData, type: value as any })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clusterTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-green-700">
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
