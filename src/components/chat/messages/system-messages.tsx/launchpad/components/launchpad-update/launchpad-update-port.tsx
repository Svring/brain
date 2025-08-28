import React, { useState } from "react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { PortsTable } from "@/components/chat/messages/system-messages.tsx/components/ports-table";
import { Port } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Network } from "lucide-react";

interface LaunchpadUpdatePortProps {
  target: BuiltinResourceTarget;
}

export const LaunchpadUpdatePort: React.FC<LaunchpadUpdatePortProps> = ({
  target,
}) => {
  const { resource, isLoading } = useResourceStatus(target);
  const [ports, setPorts] = useState<Port[]>([]);

  // Extract ports from resource when it loads
  React.useEffect(() => {
    if (
      resource &&
      "ports" in resource &&
      resource.ports &&
      Array.isArray(resource.ports)
    ) {
      setPorts(resource.ports);
    }
  }, [resource]);

  const handlePortsChange = (newPorts: Port[]) => {
    setPorts(newPorts);
    // TODO: Implement API call to update the resource with new ports
    console.log("Ports updated:", newPorts);
  };

  if (isLoading) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: Network,
          name: "Update Ports",
        }}
      >
        <div className="p-4">Loading resource data...</div>
      </BaseActionMessage>
    );
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Network,
        name: "Update Ports",
      }}
    >
      <div className="space-y-3 w-full">
        <PortsTable
          ports={ports}
          allowEditing={true}
          onPortsChange={handlePortsChange}
        />
      </div>
    </BaseActionMessage>
  );
};

export default LaunchpadUpdatePort;
