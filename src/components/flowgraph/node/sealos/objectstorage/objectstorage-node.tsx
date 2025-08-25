"use client";

import BaseNode from "../../base-node-wrapper";
import NodeHem from "../../components/node-hem";
import { Globe, Copy, KeyRound, Wifi, WifiOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ObjectStoragePolicyBadge from "./objectstorage-policy-badge";
import ObjectStorageNodeMenu from "./objectstorage-node-menu";
import ObjectStorageNodeTitle from "./objectstorage-node-title";
import NodeMonitor from "../../components/node-monitor";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { useIsMutating } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  createSealosContext,
  createObjectStorageContext,
} from "@/lib/auth/auth-utils";
import { initObjectStorageUserOptions } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-query";
import {
  useCloseObjectStorageHostMutation,
  useOpenObjectStorageHostMutation,
} from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import NodeLoading from "../../components/node-loading";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

// Enhanced wrapper that can handle both K8sResource and ObjectStorageObject
function ObjectStorageNodeWrapper({
  data,
}: {
  data: ObjectStorageObject | K8sResource;
}) {
  // Check if we have a complete ObjectStorageObject or just a basic K8sResource
  const isCompleteObject = "policy" in data && "access" in data;

  // console.log("data", data);

  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: data.kind,
    name: isCompleteObject
      ? (data as ObjectStorageObject).name
      : (data as K8sResource).metadata?.name || "",
  };

  // Always call hooks in the same order
  const { completeResource, isLoadingComplete } =
    useResourceNodeEnhancer(resourceData);
  const target = CustomResourceTargetSchema.parse(
    convertResourceObjectToTarget(resourceData)
  );
  const { status, isLoading: isLoadingStatus } = useResourceStatus(target);

  // If we have complete object data, render the full node
  if (isCompleteObject) {
    return (
      <ObjectStorageNode
        resource={data as ObjectStorageObject}
        status={status || "Pending"}
      />
    );
  }

  // If we have complete resource data from enhancement, render the full node
  if (
    completeResource &&
    "policy" in completeResource &&
    "access" in completeResource
  ) {
    return (
      <ObjectStorageNode
        resource={completeResource as unknown as ObjectStorageObject}
        status={status || "Pending"}
      />
    );
  }

  // Otherwise, show loading state
  return (
    <NodeLoading
      kind={resourceData.kind}
      name={resourceData.name}
      status={status || "Pending"}
    />
  );
}

// Main component that receives the loaded resource data
function ObjectStorageNode({
  resource,
  status,
}: {
  resource: ObjectStorageObject;
  status?: string;
}) {
  const [staticHosting, setStaticHosting] = useState(false);
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const { name, policy, access } = resource;

  const target = convertResourceObjectToTarget({
    kind: resource.kind,
    name: resource.name,
  });

  // console.log("access", access);

  // Get Sealos context for API calls
  const objectStorageContext = createObjectStorageContext();

  // Call the user init query and log the result
  const {
    data: userInitData,
    isLoading: userInitLoading,
    error: userInitError,
  } = useQuery(initObjectStorageUserOptions(objectStorageContext));

  // Add host mutations
  const closeHostMutation =
    useCloseObjectStorageHostMutation(objectStorageContext);
  const openHostMutation =
    useOpenObjectStorageHostMutation(objectStorageContext);

  // Check if this object storage is being deleted
  const isDeletingObjectStorage =
    useIsMutating({
      predicate: (mutation) => {
        // Check if this is a delete object storage mutation for this specific bucket
        const isDeleteMutation =
          mutation.options.mutationFn
            ?.toString()
            .includes("deleteObjectStorage") ?? false;
        const variables = mutation.state.variables as any;
        return isDeleteMutation && variables?.bucketName === name;
      },
    }) > 0;

  // Create hem component with static hosting controls
  const hemComponent =
    policy !== "private" ? (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Static Hosting</span>
          <Switch
            checked={staticHosting}
            onCheckedChange={setStaticHosting}
            className="scale-75"
          />
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
          }}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ) : null;

  const mainCard = (
    <BaseNode
      nodeData={resource}
      className={isDeletingObjectStorage ? "border-theme-red" : ""}
    >
      <div 
        className="flex h-full flex-col justify-between"
        onClick={() => {
          appendSystemMessage("objectstorage.detail", target);
        }}
      >
        <div className="flex flex-col gap-4">
          {/* Header with Name and Menu */}
          <div className="flex items-center justify-between">
            <ObjectStorageNodeTitle name={name} />
            <div className="flex-shrink-0">
              <ObjectStorageNodeMenu object={resource} />
            </div>
          </div>
        </div>

        {/* Bottom section with policy badge and monitor */}
        <div className="flex justify-between items-center">
          {/* Left: Policy Badge */}
          <ObjectStoragePolicyBadge policy={policy} />

          {/* Right: Monitor */}
          {/* <NodeMonitor /> */}
        </div>
      </div>
    </BaseNode>
  );

  // return <NodeHem mainCard={mainCard} hemComponent={hemComponent} />;
  return mainCard;
}

// Export the wrapper as the default component
export default ObjectStorageNodeWrapper;
