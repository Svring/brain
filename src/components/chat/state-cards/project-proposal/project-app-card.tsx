"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X } from "lucide-react";
import Image from "next/image";
import type { App, AppEnv } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { EnvTable } from "@/components/chat/messages/system-messages.tsx/components/env-table";
import { ProjectPortTable } from "./components/project-port-table";

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
        
        {/* Environment Variables Section */}
        {editData.env && editData.env.length > 0 && (
          <div>
            <label className="text-sm font-medium">Environment Variables</label>
            <div className="mt-2">
              <EnvTable
                envVars={editData.env.map(env => ({ type: "value" as const, name: env.name, value: env.value }))}
                allowEditing={true}
                onEnvVarsChange={(envVars) => 
                  setEditData({ 
                    ...editData, 
                    env: envVars.map(env => ({ 
                      name: env.name, 
                      value: env.type === "value" ? env.value : "" 
                    }))
                  })
                }
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

      <div className="text-sm pl-1 text-muted-foreground">
        Image: <span className="text-foreground">{resource.image}</span>
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
      
      {/* Environment Variables Display */}
      {resource.env && resource.env.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-2">Environment Variables:</div>
          <EnvTable
            envVars={resource.env.map(env => ({ type: "value" as const, name: env.name, value: env.value }))}
            allowEditing={false}
          />
        </div>
      )}
    </div>
  );
}
