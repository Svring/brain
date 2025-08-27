"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LaunchpadUpdateMessage from "@/components/chat/messages/system-messages.tsx/launchpad/launchpad-update-message";
import { LaunchpadUpdateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-update-schema";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export default function LaunchpadUpdateDemo() {
  // Target for all examples
  const target: BuiltinResourceTarget = {
    type: "builtin",
    resourceType: "deployment",
    name: "hello-world",
  };

  // Example 1: Update resources only
  const resourceOnlyPayload: LaunchpadUpdateRequest = {
    resource: {
      replicas: 3,
      cpu: 1,
      memory: 2,
    },
  };

  // Example 2: Update image only
  const imageOnlyPayload: LaunchpadUpdateRequest = {
    image: "nginx:1.25",
  };

  // Example 3: Update environment variables only
  const envOnlyPayload: LaunchpadUpdateRequest = {
    env: [
      { name: "NODE_ENV", value: "production" },
      { name: "PORT", value: "8080" },
      { name: "DEBUG", value: "false" },
    ],
  };

  // Example 4: Update command and args only
  const commandOnlyPayload: LaunchpadUpdateRequest = {
    command: "nginx",
    args: "-g 'daemon off;'",
  };

  // Example 5: Update multiple fields
  const multipleFieldsPayload: LaunchpadUpdateRequest = {
    resource: {
      replicas: 2,
      cpu: 0.5,
      memory: 1,
    },
    image: "nginx:1.24",
    env: [
      { name: "NODE_ENV", value: "staging" },
      { name: "PORT", value: "80" },
    ],
  };

  // Example 6: Empty payload (no fields)
  const emptyPayload: LaunchpadUpdateRequest = {};

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Launchpad Update Message Demo</h1>
          <p className="text-muted-foreground mt-2">
            Demo of the LaunchpadUpdateMessage component with different update
            scenarios
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Test Mode:</strong> This demo runs in test mode. The
              component will show what would be updated without actually making
              changes.
            </p>
          </div>
        </div>

        {/* Example 1: Update Resources Only */}
        <Card>
          <CardHeader>
            <CardTitle>Example 1: Update Resources Only</CardTitle>
            <p className="text-sm text-muted-foreground">
              Only resource fields (CPU, memory, replicas) are provided
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadUpdateMessage
              target={target}
              payload={resourceOnlyPayload}
              testMode={true}
            />
          </CardContent>
        </Card>

        {/* Example 2: Update Image Only */}
        <Card>
          <CardHeader>
            <CardTitle>Example 2: Update Image Only</CardTitle>
            <p className="text-sm text-muted-foreground">
              Only the container image is provided for update
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadUpdateMessage
              target={target}
              payload={imageOnlyPayload}
              testMode={true}
            />
          </CardContent>
        </Card>

        {/* Example 3: Update Environment Variables Only */}
        <Card>
          <CardHeader>
            <CardTitle>Example 3: Update Environment Variables Only</CardTitle>
            <p className="text-sm text-muted-foreground">
              Only environment variables are provided for update
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadUpdateMessage
              target={target}
              payload={envOnlyPayload}
              testMode={true}
            />
          </CardContent>
        </Card>

        {/* Example 4: Update Command and Args Only */}
        <Card>
          <CardHeader>
            <CardTitle>Example 4: Update Command and Args Only</CardTitle>
            <p className="text-sm text-muted-foreground">
              Only command and args are provided for update
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadUpdateMessage
              target={target}
              payload={commandOnlyPayload}
              testMode={true}
            />
          </CardContent>
        </Card>

        {/* Example 5: Update Multiple Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Example 5: Update Multiple Fields</CardTitle>
            <p className="text-sm text-muted-foreground">
              Multiple fields (resources, image, env) are provided for update
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadUpdateMessage
              target={target}
              payload={multipleFieldsPayload}
              testMode={true}
            />
          </CardContent>
        </Card>

        {/* Example 6: Empty Payload */}
        <Card>
          <CardHeader>
            <CardTitle>Example 6: Empty Payload</CardTitle>
            <p className="text-sm text-muted-foreground">
              No update fields provided - shows the "no fields" message
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadUpdateMessage
              target={target}
              payload={emptyPayload}
              testMode={true}
            />
          </CardContent>
        </Card>

        {/* Payload Examples Display */}
        <Card>
          <CardHeader>
            <CardTitle>Payload Examples</CardTitle>
            <p className="text-sm text-muted-foreground">
              The different payload examples used in the demos above
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Resources Only:</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                {JSON.stringify(resourceOnlyPayload, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Image Only:</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                {JSON.stringify(imageOnlyPayload, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">
                3. Environment Variables Only:
              </h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                {JSON.stringify(envOnlyPayload, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Command and Args Only:</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                {JSON.stringify(commandOnlyPayload, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">5. Multiple Fields:</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                {JSON.stringify(multipleFieldsPayload, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">6. Empty Payload:</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                {JSON.stringify(emptyPayload, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
