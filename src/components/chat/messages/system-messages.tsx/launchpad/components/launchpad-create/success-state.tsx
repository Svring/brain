import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Rocket } from "lucide-react";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface SuccessStateProps {
  createdDeploymentName: string;
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function SuccessState({ createdDeploymentName, form }: SuccessStateProps) {
  return (
    <Card className="w-full bg-background-secondary border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Launchpad Application Created Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <Rocket className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-medium text-green-900 dark:text-green-100">
              {createdDeploymentName}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Image: {form.getValues("image")} • CPU: {form.getValues("resource.cpu")}C
              • Memory: {form.getValues("resource.memory")}G • Replicas:{" "}
              {form.getValues("resource.replicas")}
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Your launchpad application is now ready to use. You can access it
            from the project dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
