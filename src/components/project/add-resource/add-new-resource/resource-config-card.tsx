"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCreateDevboxMutation } from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { useCreateClusterMutation } from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { useCreateLaunchpadMutation } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { useCreateObjectStorageMutation } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createDevboxContext, createSealosContext, createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectState } from "@/contexts/project/project-context";
import { toast } from "sonner";
import DevboxConfig from "@/components/project/add-resource/add-new-resource/configs/devbox-config";
import DatabaseConfig from "@/components/project/add-resource/add-new-resource/configs/database-config";
import AppLaunchpadConfig from "@/components/project/add-resource/add-new-resource/configs/app-launchpad-config";
import ObjectStorageConfig from "@/components/project/add-resource/add-new-resource/configs/object-storage-config";

interface ResourceConfigCardProps {
  resourceType: string;
  configData: any;
  onConfigChange: (field: string, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function ResourceConfigCard({
  resourceType,
  configData,
  onConfigChange,
  onBack,
  onSubmit
}: ResourceConfigCardProps) {
  // Get selected project from context
  const { selectedProject } = useProjectState();

  // Create contexts for mutations
  const devboxContext = createDevboxContext();
  const sealosContext = createSealosContext();
  const k8sContext = createK8sContext();

  // Initialize mutations
  const createDevbox = useCreateDevboxMutation(devboxContext);
  const createCluster = useCreateClusterMutation(sealosContext);
  const createLaunchpad = useCreateLaunchpadMutation(sealosContext);
  const createObjectStorage = useCreateObjectStorageMutation(sealosContext);
  const addToProject = useAddToProjectMutation(k8sContext);

  // Check if any mutation is in progress
  const isCreating = createDevbox.isPending || createCluster.isPending || 
                     createLaunchpad.isPending || createObjectStorage.isPending || 
                     addToProject.isPending;

  const resourceTypes = [
    {
      id: "devbox",
      title: "Devbox",
      description: "Create a cloud development environment with pre-configured tools and runtime",
      icon: "Terminal",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "database",
      title: "Database",
      description: "Deploy managed database services like PostgreSQL, MongoDB, MySQL, and more",
      icon: "Database",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "applaunchpad",
      title: "App Launchpad",
      description: "Deploy containerized applications with auto-scaling and load balancing",
      icon: "Rocket",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "objectstoragebucket",
      title: "Object Storage",
      description: "Create scalable object storage buckets for files, backups, and static assets",
      icon: "HardDrive",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const handleSubmit = async () => {
    if (!selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    try {
      // Create the resource first
      switch (resourceType) {
        case "devbox":
          await createDevbox.mutateAsync({
            name: configData.name,
            runtimeName: configData.runtimeName,
            cpu: parseInt(configData.cpu) || 2000,
            memory: parseInt(configData.memory) || 4096,
          });
          break;
        case "database":
          await createCluster.mutateAsync({
            name: configData.name,
            type: configData.type,
            version: configData.version,
            terminationPolicy: "Delete",
            resource: {
              cpu: configData.cpu || "1000m",
              memory: configData.memory || "1024Mi",
              storage: configData.storage || "3Gi",
              replicas: parseInt(configData.replicas) || 1,
            },
          });
          break;
        case "applaunchpad":
          await createLaunchpad.mutateAsync({
            name: configData.name,
            image: configData.image,
            storage: configData.storageVolumes || [],
            resource: {
              cpu: parseInt(configData.cpu) || 200,
              memory: parseInt(configData.memory) || 256,
              replicas: parseInt(configData.replicas) || 1,
            },
            env: configData.env || [],
            command: configData.command || "",
            args: configData.args || "",
            ports: (configData.ports || []).map((port: any) => ({
              port: parseInt(port.port) || 80,
              protocol: (port.protocol as "TCP" | "UDP" | "SCTP") || "TCP",
              appProtocol: (port.appProtocol as "HTTP" | "GRPC" | "WS") || "HTTP",
              exposesPublicDomain: port.exposesPublicDomain === true,
            })),
            configMap: [],
            hpa: null,
            imageRegistry: null,
          });
          break;
        case "objectstoragebucket":
          await createObjectStorage.mutateAsync({
            bucketName: configData.name,
            bucketPolicy: configData.policy,
          });
          break;
      }

      // Add the created resource to the project
      const getResourceTypeForTarget = (resourceType: string) => {
        switch (resourceType) {
          case "database":
            return "cluster";
          case "applaunchpad":
            return "deployment";
          case "devbox":
            return "devbox";
          case "objectstoragebucket":
            return "objectstoragebucket";
          default:
            return resourceType;
        }
      };
      
      const resourceTarget = convertResourceTypeToTarget(
        getResourceTypeForTarget(resourceType), 
        configData.name
      );
      await addToProject.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });
      
      toast.success(`${resourceTypes.find(r => r.id === resourceType)?.title} created and added to project successfully!`);
      onBack();
    } catch (error) {
      console.error("Failed to create resource:", error);
      toast.error("Failed to create resource. Please try again.");
    }
  };

  const resource = resourceTypes.find(r => r.id === resourceType);
  if (!resource) return null;

  const renderConfigContent = () => {
    switch (resourceType) {
      case "devbox":
        return <DevboxConfig configData={configData} onConfigChange={onConfigChange} />;
      case "database":
        return <DatabaseConfig configData={configData} onConfigChange={onConfigChange} />;
      case "applaunchpad":
        return <AppLaunchpadConfig configData={configData} onConfigChange={onConfigChange} />;
      case "objectstoragebucket":
        return <ObjectStorageConfig configData={configData} onConfigChange={onConfigChange} />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${resource.bgColor}`}>
            <span className={`h-6 w-6 ${resource.color}`}>{resource.icon}</span>
          </div>
          <div>
            <CardTitle className="text-lg">Create {resource.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderConfigContent()}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1" disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={
              isCreating ||
              !configData.name || 
              (resourceType === "devbox" && !configData.runtimeName) ||
              (resourceType === "database" && (!configData.type || !configData.version)) ||
              (resourceType === "applaunchpad" && (!configData.image || !configData.replicas || !configData.cpu || !configData.memory || !configData.ports || configData.ports.length === 0)) ||
              (resourceType === "objectstoragebucket" && !configData.policy)
            }
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create ${resource.title}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
