import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import DevboxNodeIde from "@/components/flowgraph/node/sealos/devbox/devbox-node-ide";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface DevboxInfoHeaderProps {
  devboxData: DevboxObject;
  regionUrl: string;
}

export const DevboxInfoHeader: React.FC<DevboxInfoHeaderProps> = ({
  devboxData,
  regionUrl,
}) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Image
              src={`https://devbox.${regionUrl}/images/runtime/${
                devboxData.image.split("-")[0]
              }.svg`}
              alt="Devbox Icon"
              width={24}
              height={24}
              className="rounded-lg h-9 w-9 flex-shrink-0"
              priority
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground leading-none">
                Devbox
              </span>
              <span className="text-lg font-bold text-foreground leading-tight truncate">
                {devboxData.name}
              </span>
            </div>
          </div>
        </div>
        <Badge>{devboxData.status}</Badge>
        <DevboxNodeIde object={devboxData} />
      </div>

      {/* Created At and Up Time Info */}
      {devboxData.operationalStatus && (
        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Created At</span>
            <span className="text-sm font-medium">
              {devboxData.operationalStatus.createdAt}
            </span>
          </div>
          {devboxData.operationalStatus.upTime && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Start Time</span>
              <span className="text-sm font-medium">
                {devboxData.operationalStatus.upTime}
              </span>
            </div>
          )}
        </div>
      )}
    </CardHeader>
  );
};
