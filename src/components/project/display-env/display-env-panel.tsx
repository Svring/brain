"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectState } from "@/contexts/project/project-context";
import DevboxEnvPanel from "./devbox-env-panel";
import LaunchpadEnvPanel from "./launchpad-env-panel";

export default function DisplayEnvPanel() {
  const { selectedProjectResources } = useProjectState();

  // Filter resources from selected project
  const devboxResources = (selectedProjectResources as any)?.filter(
    (resource: any) => resource.kind?.toLowerCase() === "devbox"
  ) || [];

  const deploymentResources = (selectedProjectResources as any)?.filter(
    (resource: any) => resource.kind?.toLowerCase() === "deployment"
  ) || [];

  return (
    <div className="">
      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="applaunchpad">App Launchpad</TabsTrigger>
          <TabsTrigger value="environment">Environment Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="mt-4">
          <DevboxEnvPanel devboxResources={devboxResources} />
        </TabsContent>

        <TabsContent value="applaunchpad" className="mt-4">
          <LaunchpadEnvPanel deploymentResources={deploymentResources} />
        </TabsContent>

        <TabsContent value="environment" className="mt-4">
          <LaunchpadEnvPanel deploymentResources={deploymentResources} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
