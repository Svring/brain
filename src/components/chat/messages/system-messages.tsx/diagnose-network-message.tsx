import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { devboxClient } from "@/components/provider/trpc-provider";
import { useQuery } from "@tanstack/react-query";
import { createMetricsContext } from "@/lib/auth/auth-utils";

interface DiagnoseNetworkMessageProps {
  payload: CustomResourceTarget | BuiltinResourceTarget;
}

export const DiagnoseNetworkMessageCard: React.FC<
  DiagnoseNetworkMessageProps
> = ({ payload }) => {
  const resourceName = payload.name || "Unknown Network Resource";
  const resourceType = payload.resourceType || "Unknown Type";

  const devboxTrpcClient = devboxClient.useTRPC();

  const { data: devboxData } = useQuery(
    devboxTrpcClient.getDevbox.queryOptions({
      target: payload as CustomResourceTarget,
    })
  );

  // Fetch ranged monitor data
  const { data: rangedMonitorData } = useQuery(
    devboxTrpcClient.getDevboxRangedMonitor.queryOptions({
      devboxName: payload.name!,
      context: createMetricsContext(),
    })
  );

  // console.log("devboxData", devboxData);
  console.log("rangedMonitorData", rangedMonitorData);

  return (
    <Card className="w-full bg-background-secondary">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-5 w-5 text-theme-blue" />
            <h3 className="text-lg font-semibold text-foreground">
              Network Diagnosis
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {resourceType}: {resourceName}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              Diagnostic analysis for this network resource will be performed.
            </p>
          </div>

          {/* Diagnostic List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Diagnostic Results
            </h4>
            <div className="space-y-2">
              {/* Devbox Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-theme-green"></div>
                  <span className="text-sm font-medium">Devbox Status</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {devboxData?.status || "Unknown"}
                </span>
              </div>

              {/* Placeholder for future diagnostic items */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  <span className="text-sm font-medium">
                    Network Connectivity
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnoseNetworkMessageCard;
