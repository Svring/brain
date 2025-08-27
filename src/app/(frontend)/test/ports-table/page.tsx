"use client";

import { PortsTable } from "@/components/chat/messages/system-messages.tsx/components/ports-table";
import type { Port } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import { useState } from "react";

const initialPorts: Port[] = [
  {
    number: 80,
    protocol: "TCP",
    privateAddress: "10.1.1.100:80",
    publicAddress: "port-80.example.com",
    serviceName: "web-service",
  },
  {
    number: 443,
    protocol: "TCP",
    privateAddress: "10.1.1.100:443",
    publicAddress: "port-443.example.com",
    serviceName: "web-service-ssl",
  },
  {
    number: 8080,
    protocol: "TCP",
    privateAddress: "10.1.1.100:8080",
    serviceName: "api-service",
  },
];

export default function PortsTablePage() {
  const [ports, setPorts] = useState<Port[]>(initialPorts);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ports Table</h1>
      <PortsTable
        ports={ports}
        allowEditing={true}
        onPortsChange={setPorts}
      />
    </div>
  );
}
