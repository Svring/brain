import { ConnectionLineType, BackgroundVariant } from "@xyflow/react";

export const REACT_FLOW_CONFIG = {
  connectionLineType: ConnectionLineType.SmoothStep,
  snapGrid: [10, 10] as [number, number],
  fitViewOptions: {
    padding: 0.2,
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
