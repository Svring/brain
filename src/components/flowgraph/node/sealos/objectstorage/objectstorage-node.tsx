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

export default function ObjectStorageNode({
  data,
}: {
  data: ObjectStorageObject;
}) {
  const [staticHosting, setStaticHosting] = useState(false);

  const { name, policy } = data;

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

  // Create hem component showing API connection status
  const hemComponent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {userInitLoading ? (
          <WifiOff className="h-3 w-3 text-muted-foreground animate-pulse" />
        ) : userInitData ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
        <span className="text-muted-foreground">
          {userInitLoading
            ? "Connecting..."
            : userInitData
            ? "API Connected"
            : "API Error"}
        </span>
      </div>
      {userInitData && (
        <span className="text-muted-foreground">
          {userInitData.CONSOLE_ACCESS_KEY.slice(0, 8)}...
        </span>
      )}
    </div>
  );

  const mainCard = (
    <BaseNode
      nodeData={data}
      className={isDeletingObjectStorage ? "border-theme-red" : ""}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-4">
          {/* Header with Name and Menu */}
          <div className="flex items-center justify-between">
            <ObjectStorageNodeTitle name={name} />
            <div className="flex-shrink-0">
              <ObjectStorageNodeMenu object={data} />
            </div>
          </div>

          {/* Static Hosting Toggle and Copy Button */}
          {/* {policy !== "private" && (
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
          )} */}
        </div>

        {/* Policy Badge */}
        <div className="flex justify-start">
          <ObjectStoragePolicyBadge policy={policy} />
        </div>
      </div>
    </BaseNode>
  );

  return <NodeHem mainCard={mainCard} hemComponent={hemComponent} />;
}
