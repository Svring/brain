"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Save, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import type { DevBox } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { SimplePortList } from "./components/simple-port-list";
import { DEVBOX_RUNTIME_ICONS } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";

// Import devbox runtimes from sealos resources
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";

interface ProjectDevBoxCardProps {
  resource: DevBox;
  onSave?: (updatedResource: DevBox) => void;
}

// Runtime Selection Dialog Component
function RuntimeSelectionDialog({
  currentRuntime,
  onRuntimeSelect,
  children,
}: {
  currentRuntime: string;
  onRuntimeSelect: (runtime: string) => void;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRuntimeSelect = (runtime: string) => {
    onRuntimeSelect(runtime);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Runtime</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {DEVBOX_RUNTIMES.map((runtime) => (
            <div
              key={runtime}
              onClick={() => handleRuntimeSelect(runtime)}
              className={`
                flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                hover:bg-muted/50 hover:border-primary/50
                ${currentRuntime === runtime 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/30'
                }
              `}
            >
              <div className="w-12 h-12 mb-3 flex items-center justify-center">
                <Image
                  src={
                    DEVBOX_RUNTIME_ICONS[runtime] ||
                    "https://devbox.bja.sealos.run/logo.svg"
                  }
                  alt={`${runtime} Icon`}
                  width={48}
                  height={48}
                  className="rounded-lg"
                  priority
                />
              </div>
              <span className="text-sm font-medium text-center leading-tight">
                {runtime}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectDevBoxCard({
  resource,
  onSave,
}: ProjectDevBoxCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(resource);

  // Sync local state with prop changes
  useEffect(() => {
    setEditData(resource);
  }, [resource]);

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
              src={
                DEVBOX_RUNTIME_ICONS[editData.runtime] ||
                "https://devbox.bja.sealos.run/logo.svg"
              }
              alt={`${editData.runtime} Icon`}
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
          <RuntimeSelectionDialog
            currentRuntime={editData.runtime}
            onRuntimeSelect={(runtime) =>
              setEditData({ ...editData, runtime: runtime as any })
            }
          >
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={
                    DEVBOX_RUNTIME_ICONS[editData.runtime] ||
                    "https://devbox.bja.sealos.run/logo.svg"
                  }
                  alt={`${editData.runtime} Icon`}
                  width={20}
                  height={20}
                  className="rounded"
                  priority
                />
                <span>{editData.runtime}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </RuntimeSelectionDialog>
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
            src={
              DEVBOX_RUNTIME_ICONS[resource.runtime] ||
              "https://devbox.bja.sealos.run/logo.svg"
            }
            alt={`${resource.runtime} Icon`}
            width={36}
            height={36}
            className="rounded-lg h-9 w-9 flex-shrink-0 p-1 bg-muted"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            DevBox
          </span>
          <span className="text-lg text-foreground leading-tight truncate">
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
      <div className="text-sm text-muted-foreground">
        Runtime: <span className="text-foreground">{resource.runtime}</span>
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
