import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, Database } from "lucide-react";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";

interface ClusterSuccessStateProps {
  createdClusterName: string;
  form: UseFormReturn<any>;
}

export function ClusterSuccessState({ createdClusterName, form }: ClusterSuccessStateProps) {
  return (
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center overflow-hidden">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs text-muted-foreground leading-none">
            Database Cluster Created
          </span>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {createdClusterName}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <Image
          src={
            CLUSTER_TYPE_ICON_MAP[
              form.getValues("type") as keyof typeof CLUSTER_TYPE_ICON_MAP
            ] || "https://dbprovider.bja.sealos.run/logo.svg"
          }
          alt={`${form.getValues("type")} Icon`}
          width={32}
          height={32}
          className="rounded-lg h-8 w-8 flex-shrink-0"
          priority
        />
        <div>
          <div className="font-medium text-green-900 dark:text-green-100">
            {form.getValues("type")} • Version: {form.getValues("version")}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            CPU: {form.getValues("cpu")}m • Memory: {form.getValues("memory")}Mi • Storage: {form.getValues("storage")}Gi • Replicas: {form.getValues("replicas")}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          Your database cluster is now ready to use. You can access it from
          the project dashboard.
        </p>
      </div>
    </div>
  );
}
