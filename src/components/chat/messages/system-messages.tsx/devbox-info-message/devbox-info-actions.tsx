import React from "react";
import { Button } from "@/components/ui/button";
import { GitBranch } from "lucide-react";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface DevboxInfoActionsProps {
  devboxData: DevboxObject;
}

export const DevboxInfoActions: React.FC<DevboxInfoActionsProps> = ({
  devboxData,
}) => {
  const { emitMessage } = useEmitSystemMessage();

  const handleReleasesClick = () => {
    emitMessage(`Fetching releases for your devbox "${devboxData.name}"...`, {
      type: "info.devboxRelease",
      payload: {
        devboxName: devboxData.name,
        releases: [], // The system will fetch and populate this
      },
    });
  };

  return (
    <div className="flex gap-3 pt-4">
      <Button
        className="flex-1"
        variant="outline"
        onClick={handleReleasesClick}
      >
        <GitBranch className="w-4 h-4 mr-2" />
        Releases
      </Button>
    </div>
  );
};
