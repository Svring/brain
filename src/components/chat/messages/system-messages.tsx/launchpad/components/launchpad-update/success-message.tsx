import React from "react";
import { CheckCircle } from "lucide-react";
import BaseSystemMessage from "../../components/base-system-message";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface SuccessMessageProps {
  target: BuiltinResourceTarget;
  launchpadName: string;
  cpu: string;
  memory: string;
  replicas: string;
  portsCount: number;
  envCount: number;
}

export function SuccessMessage({
  target,
  launchpadName,
  cpu,
  memory,
  replicas,
  portsCount,
  envCount,
}: SuccessMessageProps) {
  return (
    <BaseSystemMessage target={target}>
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        <div>
          <div className="font-medium text-green-900 dark:text-green-100">
            {launchpadName} Updated Successfully
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            CPU: {cpu}m • Memory: {memory}MB • Replicas: {replicas} • Ports: {portsCount} • Env: {envCount}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Your launchpad configuration has been updated successfully.</p>
      </div>
    </BaseSystemMessage>
  );
}
