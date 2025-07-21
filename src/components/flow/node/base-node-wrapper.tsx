"use client";

import { Handle, Position, NodeToolbar } from "@xyflow/react";
import { BaseNode } from "@/components/flow/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import {
  useDeleteResourceMutation,
  useAddEnvToResourceMutation,
  type EnvVar,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import { useRemoveFromProjectMutation } from "@/lib/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useRef, useState, useEffect } from "react";
import FloatingActionMenu from "@/components/flow/components/floating-action-menu";
import { Trash2, ArrowLeft } from "lucide-react";
// import { useChatContext } from "@copilotkit/react-ui";
import { useProjectResources } from "@/hooks/project/use-project-resources";
import { useProjectContext } from "@/contexts/project-context/project-context";
import { useClusterSecret } from "@/lib/sealos/cluster/cluster-method/cluster-query";
import { useObjectStorageSecret } from "@/lib/sealos/objectstorage/objectstorage-method/objectstorage-query";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

interface BaseNodeProps {
  children: React.ReactNode;
  target: CustomResourceTarget | BuiltinResourceTarget;
  className?: string;
  showDefaultMenu?: boolean;
  floatingMenuOptions?: {
    label: string;
    onClick: () => void;
    Icon?: React.ReactNode;
  }[];
  onShowConnectionMenu?: (show: boolean) => void;
  showConnectionMenu?: boolean;
  // Props for connection data
  clusterName?: string;
  objectStorageName?: string;
}

export default function BaseNodeWrapper({
  children,
  target,
  className,
  showDefaultMenu = true,
  floatingMenuOptions,
  onShowConnectionMenu,
  showConnectionMenu: externalShowConnectionMenu,
  clusterName,
  objectStorageName,
}: BaseNodeProps) {
  // const { setOpen } = useChatContext();
  const { state } = useProjectContext();
  const projectName = state.context.flowGraphData.project;
  const flowGraphResources = state.context.flowGraphData.resources || [];
  const projectResourcesQuery = useProjectResources(projectName);
  const context = createK8sContext();
  const removeFromProjectMutation = useRemoveFromProjectMutation(context);
  const deleteResourceMutation = useDeleteResourceMutation(context);
  const addEnvMutation = useAddEnvToResourceMutation(context);
  const nodeRef = useRef(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isNodeHovered, setIsNodeHovered] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [internalShowConnectionMenu, setInternalShowConnectionMenu] =
    useState(false);

  // Use external state if provided, otherwise use internal state
  const showConnectionMenu =
    externalShowConnectionMenu ?? internalShowConnectionMenu;

  // Fetch secrets for connections
  const clusterSecretQuery = useClusterSecret(clusterName || "");
  const objectStorageSecretQuery = useObjectStorageSecret(
    objectStorageName || ""
  );

  // Helper function to create environment variables from cluster secret
  const createClusterEnvVars = (
    secretName: string,
    clusterName: string
  ): EnvVar[] => {
    const prefix = clusterName.toUpperCase().replace(/[^A-Z0-9]/g, "_");
    return [
      {
        type: "secretKeyRef",
        key: `${prefix}_DB_HOST`,
        secretName,
        secretKey: "host",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_DB_PORT`,
        secretName,
        secretKey: "port",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_DB_USER`,
        secretName,
        secretKey: "username",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_DB_PASSWORD`,
        secretName,
        secretKey: "password",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_DB_ENDPOINT`,
        secretName,
        secretKey: "endpoint",
      },
    ];
  };

  // Helper function to create environment variables from object storage secret
  const createObjectStorageEnvVars = (
    secretName: string,
    objectStorageName: string
  ): EnvVar[] => {
    const prefix = objectStorageName.toUpperCase().replace(/[^A-Z0-9]/g, "_");
    return [
      {
        type: "secretKeyRef",
        key: `${prefix}_S3_ACCESS_KEY`,
        secretName,
        secretKey: "accessKey",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_S3_SECRET_KEY`,
        secretName,
        secretKey: "secretKey",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_S3_BUCKET`,
        secretName,
        secretKey: "bucket",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_S3_ENDPOINT_EXTERNAL`,
        secretName,
        secretKey: "external",
      },
      {
        type: "secretKeyRef",
        key: `${prefix}_S3_ENDPOINT_INTERNAL`,
        secretName,
        secretKey: "internal",
      },
    ];
  };

  // Helper function to handle connection based on resource type
  const handleConnection = async (
    resourceKind: string,
    resourceName: string
  ) => {
    // Create resource target
    const resourceTarget = flowGraphResources.find(
      (r: any) => r.kind === resourceKind && r.name === resourceName
    );

    if (!resourceTarget) {
      console.error(`Resource ${resourceKind}:${resourceName} not found`);
      return;
    }

    // Create target for the resource
    let target;
    if (resourceKind === "Deployment") {
      target = {
        type: "builtin" as const,
        resourceType: "deployment" as const,
        name: resourceName,
      };
    } else if (resourceKind === "Instance") {
      target = {
        type: "custom" as const,
        group: CUSTOM_RESOURCES.instance.group,
        version: CUSTOM_RESOURCES.instance.version,
        plural: CUSTOM_RESOURCES.instance.plural,
        name: resourceName,
      };
    } else if (resourceKind === "DevBox") {
      target = {
        type: "custom" as const,
        group: CUSTOM_RESOURCES.devbox.group,
        version: CUSTOM_RESOURCES.devbox.version,
        plural: CUSTOM_RESOURCES.devbox.plural,
        name: resourceName,
      };
    } else {
      console.error(`Unsupported resource kind: ${resourceKind}`);
      return;
    }

    // Determine environment variables based on connection type
    let envVars: EnvVar[] = [];

    if (clusterName && clusterSecretQuery.data) {
      const secretName = `${clusterName}-conn-credential`;
      envVars = createClusterEnvVars(secretName, clusterName);
    } else if (objectStorageName && objectStorageSecretQuery.data) {
      const secretName = `object-storage-key-${context.namespace.slice(
        3
      )}-${objectStorageName}`;
      envVars = createObjectStorageEnvVars(secretName, objectStorageName);
    }

    if (envVars.length === 0) {
      console.error("No environment variables to add");
      return;
    }

    try {
      await addEnvMutation.mutateAsync({ target, envVars });
      console.log(
        `Successfully connected ${
          clusterName || objectStorageName
        } to ${resourceKind}:${resourceName}`
      );
    } catch (error) {
      console.error("Failed to add environment variables:", error);
    }
  };

  // Timeout reference to control delayed hiding
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Custom hover handlers for node
  const handleNodeMouseEnter = () => setIsNodeHovered(true);
  const handleNodeMouseLeave = () => setIsNodeHovered(false);

  // Custom hover handlers for menu
  const handleMenuMouseEnter = () => setIsMenuHovered(true);
  const handleMenuMouseLeave = () => setIsMenuHovered(false);

  // Handle node click to open chat sidebar
  const handleNodeClick = () => {
    // setOpen(true);
  };

  // Effect to manage menu visibility
  useEffect(() => {
    if (isNodeHovered || isMenuHovered) {
      // Clear any existing timeout to prevent hiding
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsMenuVisible(true);
    } else {
      // Set a timeout to hide the menu after 300ms
      timeoutRef.current = setTimeout(() => {
        setIsMenuVisible(false);
      }, 300);
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isNodeHovered, isMenuHovered]);

  const defaultMenuOptions = [
    {
      label: "Remove from project",
      onClick: () =>
        removeFromProjectMutation.mutate({
          resources: [target],
        }),
      Icon: <Trash2 className="w-4 h-4" />,
    },
    {
      label: "Delete resource",
      onClick: () =>
        deleteResourceMutation.mutate({
          target: target,
        }),
      Icon: <Trash2 className="w-4 h-4" />,
    },
  ];

  const connectionMenuOptions = [
    {
      label: "Back",
      onClick: () => {
        if (externalShowConnectionMenu !== undefined) {
          onShowConnectionMenu?.(false);
        } else {
          setInternalShowConnectionMenu(false);
        }
      },
      Icon: <ArrowLeft className="w-4 h-4" />,
    },
    // Filter flowGraphResources for deployable resources (apps and devboxes)
    // ...flowGraphResources
    //   .filter(
    //     (resource: any) =>
    //       resource.kind === "Deployment" ||
    //       resource.kind === "DevBox" ||
    //       resource.kind === "Instance" // Sealos app instances
    //   )
    //   .map((resource: any) => ({
    //     label: `${resource.kind}: ${resource.name}`,
    //     onClick: () => handleConnection(resource.kind, resource.name),
    //   })),
  ];

  const menuOptions = showConnectionMenu
    ? connectionMenuOptions
    : [
        ...(floatingMenuOptions ?? []),
        ...(showDefaultMenu ? defaultMenuOptions : []),
      ];

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode
          className={className}
          ref={nodeRef}
          onMouseEnter={handleNodeMouseEnter}
          onMouseLeave={handleNodeMouseLeave}
          onClick={handleNodeClick}
        >
          <Handle position={Position.Top} type="source" />
          {children}
          <Handle position={Position.Bottom} type="target" />
        </BaseNode>
        <NodeToolbar isVisible={isMenuVisible} position={Position.Right}>
          <div
            ref={menuRef}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
            style={{
              position: "relative",
              minWidth: "200px", // Ensure consistent minimum width
              minHeight: "40px", // Ensure consistent minimum height
            }}
          >
            <FloatingActionMenu
              className="static bottom-auto right-auto"
              options={menuOptions}
            />
          </div>
        </NodeToolbar>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
