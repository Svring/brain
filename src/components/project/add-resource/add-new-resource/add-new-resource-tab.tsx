"use client";

import { useState } from "react";
import { useProjectState } from "@/contexts/project/project-context";
import ResourceTypeSelector from "./resource-type-selector";
import ResourceConfigCard from "./resource-config-card";
import { toast } from "sonner";

export default function AddNewResourceTab() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [configData, setConfigData] = useState<any>({
    cpu: "1000m",
    memory: "1024Mi",
    storage: "3Gi",
    replicas: "1",
    ports: [
      {
        port: "8080",
        protocol: "TCP",
        appProtocol: "HTTP",
        exposesPublicDomain: false,
      }
    ],
    command: "",
    args: "",
    env: [],
    storageVolumes: [],
  });
  
  // Get selected project from context
  const { selectedProject } = useProjectState();

  const handleCreateResource = (resourceType: string) => {
    setSelectedResource(resourceType);
    setConfigData({
      cpu: "1000m",
      memory: "1024Mi",
      storage: "3Gi",
      replicas: "1",
      ports: [
        {
          port: "8080",
          protocol: "TCP",
          appProtocol: "HTTP",
          exposesPublicDomain: false,
        }
      ],
      command: "",
      args: "",
      env: [],
      storageVolumes: [],
    });
  };

  const handleBack = () => {
    setSelectedResource(null);
    setConfigData({
      cpu: "1000m",
      memory: "1024Mi",
      storage: "3Gi",
      replicas: "1",
      ports: [
        {
          port: "8080",
          protocol: "TCP",
          appProtocol: "HTTP",
          exposesPublicDomain: false,
        }
      ],
      command: "",
      args: "",
      env: [],
      storageVolumes: [],
    });
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfigData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedResource) return;
    if (!selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    try {
      // This will be handled by the ResourceConfigCard component
      toast.success("Resource created and added to project successfully!");
      handleBack();
    } catch (error) {
      console.error("Failed to create resource:", error);
      toast.error("Failed to create resource. Please try again.");
    }
  };

  if (selectedResource) {
    return (
      <ResourceConfigCard
        resourceType={selectedResource}
        configData={configData}
        onConfigChange={handleConfigChange}
        onBack={handleBack}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <ResourceTypeSelector onSelectResource={handleCreateResource} />
  );
}
