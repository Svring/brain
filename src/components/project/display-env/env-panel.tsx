"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectState } from "@/contexts/project/project-context";
import type { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import type { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import type { StatefulsetObject } from "@/lib/sealos/resources/statefulset/statefulset-object-schema";
import { EnvVariablesTable } from "./env-variables-table";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import MessageHeader from "@/components/chat/messages/system-messages.tsx/components/message-header";
import _ from "lodash";

export default function EnvPanel() {
  const { selectedProjectResources } = useProjectState();

  const devboxResources =
    (_.filter(
      selectedProjectResources,
      (resource: any) => _.toLower(resource?.kind) === "devbox"
    ) as DevboxObject[]) || [];

  const deploymentResources =
    (_.filter(selectedProjectResources, (resource: any) =>
      _.includes(["deployment", "statefulset"], _.toLower(resource?.kind))
    ) as (DeploymentObject | StatefulsetObject)[]) || [];

  return (
    <div>
      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="deployments">
            Deployments & StatefulSets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="mt-4">
          {devboxResources.length === 0 ? (
            <p className="text-muted-foreground">
              No devbox resources found in the selected project.
            </p>
          ) : (
            <div className="space-y-4">
              {devboxResources.map((devbox: DevboxObject, index: number) => {
                const target = convertResourceTypeToTarget("devbox", devbox.name);
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <MessageHeader target={target} />
                    </div>

                    <EnvVariablesTable
                      envVars={devbox.env || []}
                      resourceName={devbox.name}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deployments" className="mt-4">
          {deploymentResources.length === 0 ? (
            <p className="text-muted-foreground">
              No deployment or statefulset resources found in the selected
              project.
            </p>
          ) : (
            <div className="space-y-4">
              {deploymentResources.map(
                (
                  deployment: DeploymentObject | StatefulsetObject,
                  index: number
                ) => {
                  const target = convertResourceTypeToTarget(
                    deployment.kind.toLowerCase() as "deployment" | "statefulset",
                    deployment.name
                  );
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="mb-3">
                        <MessageHeader target={target} />
                      </div>

                      <EnvVariablesTable
                        envVars={deployment.env || []}
                        resourceName={deployment.name}
                      />
                    </div>
                  );
                }
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
