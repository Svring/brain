import { ConnectionLineType, BackgroundVariant } from "@xyflow/react";

export const FLOW_CONFIG = {
  connectionLineType: ConnectionLineType.SmoothStep,
  snapGrid: [20, 20] as [number, number],
  fitViewOptions: {
    padding: 0.1,
    includeHiddenNodes: false,
    minZoom: 0.1,
    maxZoom: 1.0,
  },
  background: {
    gap: 60,
    size: 1,
    variant: BackgroundVariant.Dots,
  },
};
