"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X } from "lucide-react";
import Image from "next/image";
import type { App } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface ProjectAppCardProps {
  resource: App;
  onSave?: (updatedResource: App) => void;
}

export function ProjectAppCard({ resource, onSave }: ProjectAppCardProps) {
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
          <h5 className="font-medium">Edit Application</h5>
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
            <label className="text-sm font-medium">Image</label>
            <Input
              value={editData.image}
              onChange={(e) =>
                setEditData({ ...editData, image: e.target.value })
              }
              className="mt-1"
            />
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
            src="https://applaunchpad.bja.sealos.run/logo.svg"
            alt="App Icon"
            width={36}
            height={36}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            Application
          </span>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {resource.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">App</Badge>
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

      <p className="text-xs text-muted-foreground pl-1">
        Image: {resource.image}
      </p>
    </div>
  );
}
