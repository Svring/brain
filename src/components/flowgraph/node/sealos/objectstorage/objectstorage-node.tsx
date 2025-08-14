"use client";

import BaseNode from "../../base-node-wrapper";
import { Globe, Copy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ObjectStoragePolicyBadge from "./objectstorage-policy-badge";
import ObjectStorageNodeMenu from "./objectstorage-node-menu";
import ObjectStorageNodeTitle from "./objectstorage-node-title";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

export default function ObjectStorageNode({
  data,
}: {
  data: ObjectStorageObject;
}) {
  const [staticHosting, setStaticHosting] = useState(false);

  const { name, policy } = data;

  return (
    <BaseNode nodeData={data}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-4">
          {/* Header with Name and Menu */}
          <div className="flex items-center justify-between">
            <ObjectStorageNodeTitle name={name} />
            <div className="flex-shrink-0">
              <ObjectStorageNodeMenu />
            </div>
          </div>

          {/* Static Hosting Toggle and Copy Button */}
          {policy !== "private" && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Static Hosting
                </span>
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
          )}
        </div>

        {/* Policy Badge */}
        <div className="flex justify-start">
          <ObjectStoragePolicyBadge policy={policy} />
        </div>
      </div>
    </BaseNode>
  );
}
