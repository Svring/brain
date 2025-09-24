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
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [appData, setAppData] = useState<Partial<App>>({
    name: "",
    image: "",
    ports: [],
  });


  const handleAddApp = () => {
    if (appData.name?.trim() && appData.image?.trim()) {
      const newApp: App = {
        name: appData.name.trim(),
        image: appData.image.trim(),
        ports: appData.ports || [],
      };
      onAddApp(newApp);
      setAppDialogOpen(false);
      setAppData({ name: "", image: "", ports: [] });
    }
  };

  const handleOpenAppDialog = () => {
    setAppData({
      name: generateDefaultName("app"),
      image: "",
      ports: [],
    });
    setAppDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">App Launchpad</Label>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={handleOpenAppDialog}
            disabled={isCreating}
          >
            <Plus size={12} />
          </Button>
        </div>
        {apps.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {apps.map((app, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-muted/20 rounded border"
              >
                <span className="text-sm font-medium ml-2 truncate flex-1">
                  {app.image}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                  onClick={() => onDeleteApp(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Configuration Dialog */}
      <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Name</Label>
              <Input
                value={appData.name || ""}
                onChange={(e) =>
                  setAppData({ ...appData, name: e.target.value })
                }
                placeholder="App name"
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Image</Label>
              <Input
                value={appData.image || ""}
                onChange={(e) =>
                  setAppData({ ...appData, image: e.target.value })
                }
                placeholder="Enter image URL (e.g., nginx:latest)"
                className="w-full"
              />
            </div>

            <div>
              <SimplePortList
                ports={(appData.ports || []).map((p: any) => p.number)}
                allowEditing={true}
                onPortsChange={(portNumbers) =>
                  setAppData({
                    ...appData,
                    ports: portNumbers.map((num) => ({
                      number: num,
                      publicAccess: true,
                    })),
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAppDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddApp}
              disabled={!appData.name?.trim() || !appData.image?.trim()}
              className="flex-1"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
