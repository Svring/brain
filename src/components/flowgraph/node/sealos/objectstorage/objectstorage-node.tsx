"use client";

import { useState } from "react";
import { Globe, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BaseNode from "../../base-node-wrapper";
import ObjectStorageNodeTitle from "./objectstorage-node-title";
import ObjectStorageNodeMenu from "./objectstorage-node-menu";
import ObjectStoragePolicyBadge from "./objectstorage-policy-badge";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import type { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

function ObjectStorageNodeWrapper({ data }: { data: ObjectStorageObject }) {
  const nodeId = `${data.kind}-${data.name}`;

  return <ObjectStorageNode resource={data} nodeId={nodeId} />;
}

function ObjectStorageNode({
  resource,
  nodeId,
}: {
  resource: ObjectStorageObject;
  nodeId: string;
}) {
  const [staticHosting, setStaticHosting] = useState(false);
  const target = convertResourceObjectToTarget({
    kind: resource.kind,
    name: resource.name,
  });

  const { resource: data, status } = useResourceStatus(target);
  const { name, policy } = data || resource;

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
