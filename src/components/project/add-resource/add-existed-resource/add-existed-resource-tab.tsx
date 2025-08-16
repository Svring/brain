"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DevboxTable from "./devbox-table";
import ClusterTable from "./cluster-table";
import LaunchpadTable from "./launchpad-table";
import ObjectStorageTable from "./object-storage-table";

export default function AddExistedResourceTab() {
  return (
    <div className="w-full">
      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="cluster">Cluster</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
          <TabsTrigger value="objectstorage">Object Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="">
          <DevboxTable />
        </TabsContent>

        <TabsContent value="cluster" className="">
          <ClusterTable />
        </TabsContent>

        <TabsContent value="launchpad" className="">
          <LaunchpadTable />
        </TabsContent>

        <TabsContent value="objectstorage" className="">
          <ObjectStorageTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
