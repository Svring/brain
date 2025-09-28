"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { SimplePortList } from "@/components/chat/state-cards/project-proposal/components/simple-port-list";
import type { App } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { generateDefaultName } from "./resource-utils";

interface AppResourceProps {
  apps: App[];
  onAddApp: (app: App) => void;
  onDeleteApp: (index: number) => void;
  isCreating: boolean;
}

export function AppResource({
  apps,
  onAddApp,
  onDeleteApp,
  isCreating,
}: AppResourceProps) {
  // Inline editing handlers
  const handleAddAppInline = () => {
    const newApp: App = {
      name: generateDefaultName("app"),
      image: "nginx:latest",
      ports: [],
    };
    onAddApp(newApp);
  };



  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">App Launchpad</Label>
        
        {/* Existing apps */}
        {apps.length > 0 && (
          <div className="space-y-2">
            {apps.map((app, index) => (
              <div
                key={index}
                className="flex items-center p-2 py-1 bg-muted/20 rounded border"
              >
                {/* App image input on the left */}
                <div className="flex-shrink-0 min-w-32">
                  <Input
                    value={app.image}
                    onChange={(e) => {
                      const updatedApp = { ...app, image: e.target.value };
                      onDeleteApp(index);
                      onAddApp(updatedApp);
                    }}
                    className="w-auto min-w-32 border-none shadow-none focus-visible:ring-0 bg-transparent! pl-0 text-sm"
                    placeholder="Image (e.g., nginx:latest)"
                    style={{
                      width: `${Math.max(app.image.length * 8, 96)}px`,
                    }}
                    disabled={isCreating}
                  />
                </div>

                {/* Ports in the middle */}
                <div className="flex-1 mx-2">
                  <SimplePortList
                    ports={app.ports?.map((p: any) => p.number) || []}
                    allowEditing={true}
                    onPortsChange={(portNumbers) => {
                      const updatedApp = {
                        ...app,
                        ports: portNumbers.map((num) => ({
                          number: num,
                          publicAccess: true,
                        })),
                      };
                      onDeleteApp(index);
                      onAddApp(updatedApp);
                    }}
                  />
                </div>
                
                {/* Delete button on the right */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onDeleteApp(index)}
                  disabled={isCreating}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new app */}
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
          onClick={handleAddAppInline}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Add new app
            </span>
          </div>
        </div>
      </div>

    </>
  );
}
