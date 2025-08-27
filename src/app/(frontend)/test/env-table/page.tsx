"use client";

import { EnvTable } from "@/components/chat/messages/system-messages.tsx/components/env-table";
import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";
import { useState } from "react";

const initialEnvVars: EnvVar[] = [
  {
    type: "value",
    name: "DATABASE_URL",
    value: "postgresql://localhost:5432/myapp",
  },
  {
    type: "value",
    name: "NODE_ENV",
    value: "production",
  },
  {
    type: "secretKeyRef",
    name: "API_KEY",
    secretName: "app-secrets",
    secretKey: "api-key",
  },
  {
    type: "value",
    name: "PORT",
    value: "3000",
  },
  {
    type: "secretKeyRef",
    name: "DB_PASSWORD",
    secretName: "database-secrets",
    secretKey: "password",
  },
  {
    type: "value",
    name: "LOG_LEVEL",
    value: "info",
  },
];

export default function EnvTablePage() {
  const [envVars, setEnvVars] = useState<EnvVar[]>(initialEnvVars);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Table</h1>
      <EnvTable 
        envVars={envVars} 
        allowEditing={true}
        onEnvVarsChange={setEnvVars}
      />
    </div>
  );
}
