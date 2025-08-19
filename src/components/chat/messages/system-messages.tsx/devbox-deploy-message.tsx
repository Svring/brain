import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { devboxClient } from "@/components/provider/trpc-provider";
import { useQuery } from "@tanstack/react-query";
import { DevboxDeployResponse } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas/devbox-release-schema";
import { GetAppsResponse } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas/application-schema";

interface DevboxDeployMessageProps {
  payload: DevboxDeployResponse;
}

export const DevboxDeployMessageCard: React.FC<DevboxDeployMessageProps> = ({
  payload,
}) => {
  const devboxTrpcClient = devboxClient.useTRPC();

  // Fetch apps using the getApps query
  const {
    data: appsData,
    isLoading: appsLoading,
    error: appsError,
  } = useQuery(devboxTrpcClient.getApps.queryOptions());

  const deployData = payload.data;
  const apps = appsData?.data || [];

  return (
    <Card className="w-full bg-node-background border border-border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          DevBox Deployed Successfully
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Deploy Result */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{deployData.appName}</h3>
              <p className="text-muted-foreground">{deployData.message}</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Deployed
            </Badge>
          </div>

          {/* Public Domains */}
          {deployData.publicDomains && deployData.publicDomains.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Public Domains
              </h4>
              <div className="space-y-2">
                {deployData.publicDomains.map((domain, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {domain.host}:{domain.port}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`http://${domain.host}:${domain.port}`, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Apps List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground">
              Current Applications
            </h4>
            {appsLoading && (
              <span className="text-xs text-muted-foreground">Loading...</span>
            )}
          </div>

          {appsError ? (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                Failed to load applications
              </span>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No applications found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h5 className="font-medium text-sm">{app.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(app.createTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        app.status.value === "Running" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {app.status.label}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {app.cpu}m CPU • {app.memory}Mi Memory
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DevboxDeployMessageCard;
