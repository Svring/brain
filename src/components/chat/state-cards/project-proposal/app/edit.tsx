"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import type { App } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface AppEditProps {
  resource: App;
  onSave: (updatedResource: App) => void;
  onCancel: () => void;
}

export function AppEdit({ resource, onSave, onCancel }: AppEditProps) {
  const [editData, setEditData] = useState(resource);

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="space-y-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-purple-800">Edit Application</h5>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
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
          <label className="text-sm font-medium text-purple-700">Name</label>
          <Input
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-purple-700">Image</label>
          <Input
            value={editData.image}
            onChange={(e) =>
              setEditData({ ...editData, image: e.target.value })
            }
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-purple-700">
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
