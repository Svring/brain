// Re-export the modular LaunchpadCreateMessage component
export { default } from "./components/launchpad-create";

// Define the props interface here since types file is removed
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

export interface DeploymentCreateMessageProps {
  payload?: LaunchpadCreateRequest;
  testMode?: boolean;
}