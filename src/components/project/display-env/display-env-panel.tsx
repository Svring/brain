"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectState } from "@/contexts/project/project-context";

export default function DisplayEnvPanel() {
  const { selectedProjectResources } = useProjectState();

  // Filter deployment resources from selected project
  const deploymentResources =
    (selectedProjectResources as any)?.filter(
      (resource: any) => resource.kind?.toLowerCase() === "deployment"
    ) || [];

  return (
    <div className="">
      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="applaunchpad">App Launchpad</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Devbox Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Devbox environment information will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applaunchpad" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>App Launchpad - Deployment Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {deploymentResources.length === 0 ? (
                <p className="text-muted-foreground">
                  No deployment resources found in the selected project.
                </p>
              ) : (
                <div className="space-y-4">
                  {deploymentResources.map((deployment: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-medium text-lg">
                          {deployment.name}
                        </h3>
                        <Badge variant="secondary">{deployment.kind}</Badge>
                      </div>

                      {deployment.env && deployment.env.length > 0 ? (
                        <div>
                          <div className="space-y-2">
                            {deployment.env.map(
                              (envVar: any, envIndex: number) => (
                                <div
                                  key={envIndex}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <span className="font-mono bg-muted px-2 py-1 rounded">
                                    {envVar.name}
                                  </span>
                                  {envVar.value && (
                                    <>
                                      <span>=</span>
                                      <span className="font-mono bg-muted px-2 py-1 rounded">
                                        {envVar.value}
                                      </span>
                                    </>
                                  )}
                                  {envVar.valueFrom && (
                                    <>
                                      <span>=</span>
                                      <span className="text-muted-foreground">
                                        From:{" "}
                                        {envVar.valueFrom.secretKeyRef?.name ||
                                          "Unknown"}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No environment variables configured for this
                          deployment.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
