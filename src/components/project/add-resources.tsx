"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type {
  DevBox,
  Database,
  App,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { DevboxResource } from "./add-resources/devbox-resource";
import { DatabaseResource } from "./add-resources/database-resource";
import { AppResource } from "./add-resources/app-resource";
import { useResourceCreator } from "./add-resources/resource-creator";

interface AddNewResourcesProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function AddNewResources({ onBack, onSuccess }: AddNewResourcesProps) {
  // State for resources to be created
  const [resourcesToCreate, setResourcesToCreate] = useState<{
    devboxes: DevBox[];
    databases: Database[];
    apps: App[];
  }>({
    devboxes: [],
    databases: [],
    apps: [],
  });

  const { handleAdd, isCreating } = useResourceCreator({
    resourcesToCreate,
    onSuccess,
    onBack,
  });

  const handleCancel = () => {
    setResourcesToCreate({
      devboxes: [],
      databases: [],
      apps: [],
    });
    onBack();
  };

  // Resource creation handlers - add to list
  const handleAddDevbox = (devbox: DevBox) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      devboxes: [...prev.devboxes, devbox],
    }));
  };

  const handleAddDatabase = (database: Database) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      databases: [...prev.databases, database],
    }));
  };

  const handleAddApp = (app: App) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      apps: [...prev.apps, app],
    }));
  };

  // Delete resource functions
  const handleDeleteDevbox = (index: number) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      devboxes: prev.devboxes.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteDatabase = (index: number) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      databases: prev.databases.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteApp = (index: number) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      apps: prev.apps.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header with Back Button */}
        <div className="border-b border-border p-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-semibold">Add New Resources</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Three Resource Sections */}
          <div className="space-y-4">
            <DevboxResource
              devboxes={resourcesToCreate.devboxes}
              onAddDevbox={handleAddDevbox}
              onDeleteDevbox={handleDeleteDevbox}
              isCreating={isCreating}
            />

            <DatabaseResource
              databases={resourcesToCreate.databases}
              onAddDatabase={handleAddDatabase}
              onDeleteDatabase={handleDeleteDatabase}
              isCreating={isCreating}
            />

            <AppResource
              apps={resourcesToCreate.apps}
              onAddApp={handleAddApp}
              onDeleteApp={handleDeleteApp}
              isCreating={isCreating}
            />
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="p-4 pt-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? "Adding..." : "Add To Project"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
