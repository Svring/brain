"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LaunchpadCreateMessage from "@/components/chat/messages/system-messages.tsx/launchpad/launchpad-create-message";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

export default function LaunchpadCreateDemo() {
  // Single dummy data example
  const dummyPayload: LaunchpadCreateRequest = {
    name: "my-nginx-app",
    image: "nginx:1.21",
    command: "",
    args: "",
    resource: {
      replicas: 2,
      cpu: 0.5,
      memory: 1,
    },
    ports: [
      {
        port: 80,
        protocol: "TCP",
        appProtocol: "HTTP",
        exposesPublicDomain: true,
      },
      {
        port: 443,
        protocol: "TCP",
        appProtocol: "HTTP",
        exposesPublicDomain: true,
      },
    ],
    env: [
      { name: "NODE_ENV", value: "production" },
      { name: "PORT", value: "80" },
    ],
    storage: [{ name: "app-storage", path: "/app/data", size: "5Gi" }],
    configMap: [
      {
        path: "/etc/nginx/conf.d/default.conf",
        value:
          "server { listen 80; location / { root /usr/share/nginx/html; } }",
      },
    ],
    hpa: null,
    imageRegistry: null,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Launchpad Create Message Demo</h1>
          <p className="text-muted-foreground mt-2">
            Demo of the LaunchpadCreateMessage component with pre-populated data
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Test Mode:</strong> This demo runs in test mode. The
              component will show what would be created without actually
              deploying.
            </p>
          </div>
        </div>

        {/* Launchpad Create Component Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Launchpad Create Message Component</CardTitle>
            <p className="text-sm text-muted-foreground">
              Example with a pre-configured nginx application
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadCreateMessage payload={dummyPayload} testMode={true} />
          </CardContent>
        </Card>

        {/* Payload Display */}
        <Card>
          <CardHeader>
            <CardTitle>Payload Data</CardTitle>
            <p className="text-sm text-muted-foreground">
              The data being passed to the component
            </p>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
              {JSON.stringify(dummyPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
