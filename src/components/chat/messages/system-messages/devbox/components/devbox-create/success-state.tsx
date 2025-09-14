import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, Package } from "lucide-react";
import { DevboxCreate } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-mutation-schema";

interface SuccessStateProps {
  createdDevboxName: string;
  form: UseFormReturn<DevboxCreate>;
}

export function SuccessState({ createdDevboxName, form }: SuccessStateProps) {
  return (
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            DevBox
          </span>
          <span className="text-lg text-foreground leading-tight">
            {createdDevboxName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
        <div>
          <div className="font-medium text-green-900 dark:text-green-100">
            DevBox Created Successfully
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Runtime: {form.getValues("runtime.template")} • CPU:{" "}
            {parseInt(form.getValues("resource.cpu")) / 1000}C • Memory: {parseInt(form.getValues("resource.memory")) / 1024}G
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          Your devbox is now ready to use. You can access it from the
          project dashboard.
        </p>
      </div>
    </div>
  );
}
