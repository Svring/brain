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
import type { DevBox } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

// Import runtime options from devbox create message
import { runtimeOptions } from "@/components/chat/messages/system-messages.tsx/devbox/devbox-create-message";

interface DevBoxEditProps {
  resource: DevBox;
  onSave: (updatedResource: DevBox) => void;
  onCancel: () => void;
}

export function DevBoxEdit({ resource, onSave, onCancel }: DevBoxEditProps) {
  const [editData, setEditData] = useState(resource);

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-blue-800">Edit DevBox</h5>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
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
          <label className="text-sm font-medium text-blue-700">Name</label>
          <Input
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-blue-700">Runtime</label>
          <Select
            value={editData.runtime}
            onValueChange={(value) =>
              setEditData({ ...editData, runtime: value as any })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {runtimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-blue-700">
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
