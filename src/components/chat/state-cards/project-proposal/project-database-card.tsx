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
      <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Image
              src={
                CLUSTER_TYPE_ICON_MAP[
                  editData.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                ] ||
                "https://dbprovider.bja.sealos.run/logo.svg"
              }
              alt={`${editData.type} Icon`}
              width={36}
              height={36}
              className="rounded-lg h-9 w-9 flex-shrink-0"
              priority
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
            value={editData.type}
            onValueChange={(value) =>
              setEditData({ ...editData, type: value as any })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select database type" />
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
    );
  }

  return (
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
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
        Type: <span className="text-foreground">{resource.type}</span>
      </div>
    </div>
  );
}
