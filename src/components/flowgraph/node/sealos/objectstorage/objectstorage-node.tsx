"use client";

import { useState } from "react";
import { Globe, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BaseNode from "../../base-node-wrapper";
import NodeLoading from "../../components/node-loading";
import ObjectStorageNodeTitle from "./objectstorage-node-title";
import ObjectStorageNodeMenu from "./objectstorage-node-menu";
import ObjectStoragePolicyBadge from "./objectstorage-policy-badge";
import { useNodeData } from "@/hooks/flowgraph/use-node-data";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

function ObjectStorageNodeWrapper({
  data,
}: {
  data: ObjectStorageObject | any;
}) {
  const isCompleteObject = "policy" in data && "access" in data;
  const resourceData = { kind: "objectstoragebucket", name: data.name };
  const nodeId = `${resourceData.kind}-${resourceData.name}`;

  const { completeResource, isLoadingComplete } = useNodeData(resourceData);
  const target = CustomResourceTargetSchema.parse(
    convertResourceObjectToTarget(resourceData)
  );
  const { status } = useResourceStatus(target);

  if (isCompleteObject) {
    return (
      <ObjectStorageNode
        resource={data}
        status={status || "Pending"}
        nodeId={nodeId}
      />
    );
  }

  if (completeResource?.policy && completeResource?.access) {
    return (
      <ObjectStorageNode
        resource={completeResource}
        status={status || "Pending"}
        nodeId={nodeId}
      />
    );
  }

  return (
    <NodeLoading
      kind={resourceData.kind}
      name={resourceData.name}
      status={status || "Pending"}
    />
  );
}

function ObjectStorageNode({
  resource,
  status,
  nodeId,
}: {
  resource: ObjectStorageObject;
  status?: string;
  nodeId: string;
}) {
  const [staticHosting, setStaticHosting] = useState(false);
  const { name, policy } = resource;
  const target = convertResourceObjectToTarget({ kind: resource.kind, name });

  const hemComponent = policy !== "private" && (
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
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );

  return (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType="objectstorage.detail"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <ObjectStorageNodeTitle name={name} />
          <ObjectStorageNodeMenu object={resource} />
        </div>
        <div className="flex justify-between items-center">
          <ObjectStoragePolicyBadge policy={policy} />
        </div>
      </div>
    </BaseNode>
  );
}

export default ObjectStorageNodeWrapper;
