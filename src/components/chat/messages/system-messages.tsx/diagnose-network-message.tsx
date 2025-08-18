import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Play } from "lucide-react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { devboxClient } from "@/components/provider/trpc-provider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createMetricsContext } from "@/lib/auth/auth-utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DiagnoseNetworkMessageProps {
  payload: CustomResourceTarget | BuiltinResourceTarget;
}

export const DiagnoseNetworkMessageCard: React.FC<
  DiagnoseNetworkMessageProps
> = ({ payload }) => {
  const [devboxStatus, setDevboxStatus] = useState<string>("");
  const devboxTrpcClient = devboxClient.useTRPC();

  // Mutation for managing devbox lifecycle
  const startDevbox = useMutation(
    devboxTrpcClient.manageDevboxLifecycle.mutationOptions()
  );

  const { data: devboxData } = useQuery(
    devboxTrpcClient.getDevbox.queryOptions({
      target: payload as CustomResourceTarget,
    })
  );

  // Fetch ranged monitor data (only if devbox is running)
  const { data: rangedMonitorData } = useQuery({
    ...devboxTrpcClient.getDevboxRangedMonitor.queryOptions({
      devboxName: payload.name!,
      context: createMetricsContext(),
    }),
    enabled:
      !!devboxData &&
      !["stopped", "shutdown"].includes(devboxStatus.toLowerCase() || ""),
  });

  // Update devbox status when data changes
  useEffect(() => {
    if (devboxData?.status) {
      setDevboxStatus(devboxData.status.toLowerCase());
    }
  }, [devboxData?.status]);

  // console.log("devboxData", devboxData);
  console.log("rangedMonitorData", rangedMonitorData);

  return (
    <Card className="w-full bg-node-background">
      <CardContent className="">
        {/* Header */}
        <div className="">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-5 w-5 text-theme-blue" />
            <h3 className="text-lg font-semibold text-foreground">
              Network Diagnosis
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {payload.resourceType}: {payload.name}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Diagnostic List */}
          <div className="space-y-3">
            <div className="space-y-2">
              {/* Devbox Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-theme-green"></div>
                  <span className="text-sm font-medium">Devbox Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {devboxData?.status || "Unknown"}
                  </span>
                  {["stopped", "shutdown"].includes(devboxStatus) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={async () => {
                        try {
                          await startDevbox.mutate({
                            devboxName: payload.name!,
                            action: "start",
                          });
                          toast.success("Devbox started successfully");
                        } catch (error) {
                          toast.error("Failed to start devbox");
                          console.error("Error starting devbox:", error);
                        }
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </div>

              {/* Resource Usage Check */}
              {!["stopped", "shutdown"].includes(devboxStatus) && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        rangedMonitorData ? "bg-theme-green" : "bg-theme-yellow"
                      }`}
                    ></div>
                    <span className="text-sm font-medium">Resource Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {rangedMonitorData
                      ? "Completed"
                      : "Checking resource usage..."}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnoseNetworkMessageCard;
