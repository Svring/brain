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
import type { DevBox } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { ProjectPortTable } from "./components/project-port-table";

// Import runtime options from devbox create message
import { runtimeOptions } from "@/components/chat/messages/system-messages.tsx/devbox/devbox-create-message";

interface ProjectDevBoxCardProps {
  resource: DevBox;
  onSave?: (updatedResource: DevBox) => void;
}

export function ProjectDevBoxCard({
  resource,
  onSave,
}: ProjectDevBoxCardProps) {
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
          <h5 className="font-medium">Edit DevBox</h5>
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
            <label className="text-sm font-medium">Runtime</label>
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
        
        {/* Ports Section */}
        {editData.ports && editData.ports.length > 0 && (
          <div>
            <label className="text-sm font-medium">Ports</label>
            <div className="mt-2">
              <ProjectPortTable
                ports={editData.ports}
                allowEditing={true}
                onPortsChange={(ports) => setEditData({ ...editData, ports })}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src="https://devbox.bja.sealos.run/logo.svg"
            alt="DevBox Icon"
            width={36}
            height={36}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            DevBox
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
        Runtime: <span className="text-foreground">{resource.runtime}</span>
      </div>
      
      {/* Ports Display */}
      {resource.ports && resource.ports.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-2">Ports:</div>
          <ProjectPortTable
            ports={resource.ports}
            allowEditing={false}
          />
        </div>
      )}
    </div>
  );
}
