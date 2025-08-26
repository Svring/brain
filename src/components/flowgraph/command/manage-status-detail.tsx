"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useProjectState } from "@/contexts/project/project-context";

interface ResourceStatus {
  id: string;
  name: string;
  type: string;
  status: "running" | "stopped" | "error" | "pending";
  lastUpdated: string;
}

export function ManageStatusDetail() {
  const { selectedProjectResources } = useProjectState();
  const [resources, setResources] = useState<ResourceStatus[]>([
    {
      id: "1",
      name: "devbox-main",
      type: "Devbox",
      status: "running",
      lastUpdated: "2 minutes ago"
    },
    {
      id: "2", 
      name: "postgres-db",
      type: "Database",
      status: "running",
      lastUpdated: "1 minute ago"
    },
    {
      id: "3",
      name: "app-server",
      type: "App Launchpad",
      status: "stopped",
      lastUpdated: "5 minutes ago"
    },
    {
      id: "4",
      name: "storage-bucket",
      type: "Object Storage",
      status: "running",
      lastUpdated: "30 seconds ago"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "stopped":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge variant="default" className="bg-green-100 text-green-800">Running</Badge>;
      case "stopped":
        return <Badge variant="secondary">Stopped</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleStart = (id: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === id ? { ...resource, status: "running" as const } : resource
    ));
  };

  const handleStop = (id: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === id ? { ...resource, status: "stopped" as const } : resource
    ));
  };

  const handleRestart = (id: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === id ? { ...resource, status: "pending" as const } : resource
    ));
    // Simulate restart
    setTimeout(() => {
      setResources(prev => prev.map(resource => 
        resource.id === id ? { ...resource, status: "running" as const } : resource
      ));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resource Status Management</h3>
          <p className="text-sm text-muted-foreground">
            Monitor and control the status of your project resources
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(resource.status)}
                  <div>
                    <CardTitle className="text-base">{resource.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{resource.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(resource.status)}
                  <span className="text-xs text-muted-foreground">
                    {resource.lastUpdated}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                {resource.status === "stopped" && (
                  <Button size="sm" onClick={() => handleStart(resource.id)}>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                {resource.status === "running" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleStop(resource.id)}>
                      <Pause className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRestart(resource.id)}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Restart
                    </Button>
                  </>
                )}
                {resource.status === "error" && (
                  <Button size="sm" onClick={() => handleRestart(resource.id)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
                {resource.status === "pending" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Click Start to activate a stopped resource</p>
        <p>• Click Stop to deactivate a running resource</p>
        <p>• Click Restart to restart a running resource</p>
        <p>• Status updates automatically every 30 seconds</p>
      </div>
    </div>
  );
}
