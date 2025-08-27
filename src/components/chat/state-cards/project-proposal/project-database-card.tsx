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
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import type { Database as DatabaseType } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

// Import database type options from cluster create message
import { clusterTypeOptions } from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";

interface ProjectDatabaseCardProps {
  resource: DatabaseType;
  onSave?: (updatedResource: DatabaseType) => void;
}

export function ProjectDatabaseCard({ resource, onSave }: ProjectDatabaseCardProps) {
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
          <h5 className="font-medium">Edit Database</h5>
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
            <label className="text-sm font-medium">Type</label>
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
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src={
              CLUSTER_TYPE_ICON_MAP[
                resource.type as keyof typeof CLUSTER_TYPE_ICON_MAP
              ] ||
              "https://dbprovider.bja.sealos.run/logo.svg"
            }
            alt={`${resource.type} Icon`}
            width={36}
            height={36}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            Database
          </span>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {resource.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{resource.type}</Badge>
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
