import React from "react";
import { ProjectLogEntry } from "@/lib/brain/resources/project/project-api/project-api-service";

interface ProjectLogRenderProps {
  result: ProjectLogEntry[] | undefined;
}

export function ProjectLogRender({ result }: ProjectLogRenderProps) {
  if (!result) return <div></div>;

  return (
    <div className="space-y-4 bg-background-secondary">
      <h3 className="text-lg font-semibold">Project Logs</h3>
      {result.map(
        (
          resourceLogs: { name: string; kind: string; logs: any },
          index: number
        ) => (
          <div key={index} className="border rounded-lg p-4">
            <h4 className="font-medium text-sm">
              {resourceLogs.kind}: {resourceLogs.name}
            </h4>
            <div className="mt-2">
              {resourceLogs.logs.error ? (
                <div className="text-red-600 text-sm">
                  {resourceLogs.logs.error}
                </div>
              ) : resourceLogs.logs.supported === false ? (
                <div className="text-yellow-600 text-sm">
                  {resourceLogs.logs.message}
                </div>
              ) : (
                <pre className="text-xs p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(resourceLogs.logs, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
