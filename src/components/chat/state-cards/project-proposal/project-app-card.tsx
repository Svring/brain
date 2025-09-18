"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X } from "lucide-react";
import Image from "next/image";
import type { App } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { SimplePortList } from "./components/simple-port-list";

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
      <div className="space-y-3 flex-col bg-background-secondary border p-3 rounded-xl">
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
        {/* Image field first */}
        <div className="pl-1">
          <div className="text-sm font-medium text-muted-foreground mb-2">Image:</div>
          <Input
            value={editData.image}
            onChange={(e) =>
              setEditData({ ...editData, image: e.target.value })
            }
            placeholder="Enter image URL"
            className="w-full"
          />
        </div>

        {/* Ports Section */}
        <div className="mt-3">
          <SimplePortList
            ports={(editData.ports || []).map(p => p.number)}
            allowEditing={true}
            onPortsChange={(portNumbers) => 
              setEditData({ 
                ...editData, 
                ports: portNumbers.map(num => ({ number: num, publicAccess: true }))
              })
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 flex-col bg-background-secondary border p-3 rounded-xl">
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

      {/* Image field first */}
      <div className="text-sm pl-1 text-muted-foreground">
        Image: <span className="text-foreground">{resource.image}</span>
      </div>

      {/* Ports Display */}
      <div className="mt-3">
        <SimplePortList 
          ports={(resource.ports || []).map(p => p.number)} 
          allowEditing={false} 
        />
      </div>
    </div>
  );
}
