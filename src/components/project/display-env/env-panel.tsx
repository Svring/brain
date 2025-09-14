"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useProjectState } from "@/contexts/project/project-context";
import type { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import type { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import type { StatefulsetObject } from "@/lib/sealos/resources/statefulset/statefulset-object-schema";
import { EnvVariablesTable } from "./env-variables-table";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import MessageHeader from "@/components/chat/messages/system-messages/components/base-resourec-message-header";
import _ from "lodash";

export default function EnvPanel() {
  const { selectedProjectResources } = useProjectState();
  const [devboxSearch, setDevboxSearch] = useState("");
  const [deploymentSearch, setDeploymentSearch] = useState("");

  const devboxResources =
    (_.filter(
      selectedProjectResources,
      (resource: any) => _.toLower(resource?.kind) === "devbox"
    ) as DevboxObject[]) || [];

  const deploymentResources =
    (_.filter(selectedProjectResources, (resource: any) =>
      _.includes(["deployment", "statefulset"], _.toLower(resource?.kind))
    ) as (DeploymentObject | StatefulsetObject)[]) || [];

  // Filter devbox resources based on search
  const filteredDevboxResources = useMemo(() => {
    if (!devboxSearch.trim()) return devboxResources;

    return _.filter(devboxResources, (devbox: DevboxObject) => {
      const searchTerm = devboxSearch.toLowerCase();
      return (
        devbox.name.toLowerCase().includes(searchTerm) ||
        _.some(
          devbox.env || [],
          (envVar: any) =>
            envVar.key?.toLowerCase().includes(searchTerm) ||
            envVar.value?.toLowerCase().includes(searchTerm)
        )
      );
    });
  }, [devboxResources, devboxSearch]);

  // Filter deployment resources based on search
  const filteredDeploymentResources = useMemo(() => {
    if (!deploymentSearch.trim()) return deploymentResources;

    return _.filter(
      deploymentResources,
      (deployment: DeploymentObject | StatefulsetObject) => {
        const searchTerm = deploymentSearch.toLowerCase();
        return (
          deployment.name.toLowerCase().includes(searchTerm) ||
          deployment.kind.toLowerCase().includes(searchTerm) ||
          _.some(
            deployment.env || [],
            (envVar: any) =>
              envVar.key?.toLowerCase().includes(searchTerm) ||
              envVar.value?.toLowerCase().includes(searchTerm)
          )
        );
      }
    );
  }, [deploymentResources, deploymentSearch]);

  return (
    <div>
      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="deployments">
            Deployments & StatefulSets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="">
          <div className="mb-4">
            <Input
              placeholder="Search devbox resources and environment variables..."
              value={devboxSearch}
              onChange={(e) => setDevboxSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {filteredDevboxResources.length === 0 ? (
            <p className="text-muted-foreground">
              {devboxSearch.trim()
                ? "No devbox resources match your search."
                : "No devbox resources found in the selected project."}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredDevboxResources.map(
                (devbox: DevboxObject, index: number) => {
                  const target = convertResourceTypeToTarget(
                    "devbox",
                    devbox.name
                  );
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
                }
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deployments" className="">
          <div className="mb-4">
            <Input
              placeholder="Search deployment/statefulset resources and environment variables..."
              value={deploymentSearch}
              onChange={(e) => setDeploymentSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {filteredDeploymentResources.length === 0 ? (
            <p className="text-muted-foreground">
              {deploymentSearch.trim()
                ? "No deployment or statefulset resources match your search."
                : "No deployment or statefulset resources found in the selected project."}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredDeploymentResources.map(
                (
                  deployment: DeploymentObject | StatefulsetObject,
                  index: number
                ) => {
                  const target = convertResourceTypeToTarget(
                    deployment.kind.toLowerCase() as
                      | "deployment"
                      | "statefulset",
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
