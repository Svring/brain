import React, { useEffect } from "react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { useResource } from "@/hooks/sealos/use-resource";

// Union type for the parameter that can be either devbox or launchpad
type NetworkDiagnosticTarget = DevboxObject | LaunchpadObject;

interface DiagnoseNetworkProps {
  target: NetworkDiagnosticTarget;
}

export const DiagnoseNetwork: React.FC<DiagnoseNetworkProps> = ({ target }) => {
  // Use the unified resource hook
  const {
    data: resourceData,
    isLoading,
    error,
    isDevbox,
    isLaunchpad,
  } = useResource(target);

  return <div>{/* Component content will be implemented later */}</div>;
};
