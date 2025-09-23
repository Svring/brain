import React, { useState } from "react";
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  MarkerType,
  useInternalNode,
  EdgeLabelRenderer,
} from "@xyflow/react";

import { getEdgeParams } from "@/lib/flowgraph/edges/flowgraph-edges-utils";
import { useProjectActions } from "@/contexts/project/project-context";
import { useDiagnoseNetwork } from "@/hooks/copilot/use-analyze-network";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

function FloatingErrorEdge(props: EdgeProps) {
  const { id, source, target, markerEnd } = props;
  const [isHovered, setIsHovered] = useState(false);

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const resourceTarget = targetNode?.data.target as
    | CustomResourceTarget
    | BuiltinResourceTarget
    | undefined;

  const { selectResource } = useProjectActions();

  if (!sourceNode || !targetNode || !resourceTarget) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const errorColor = "#9F833B";

  const edgeStyle = {
    stroke: errorColor,
    strokeWidth: isHovered ? 2 : 1.5,
    strokeDasharray: "5,5", // Dashed line to indicate error state
    transition: "all 0.2s ease-in-out",
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (resourceTarget) {
      selectResource(resourceTarget);
    }
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "help" }}
    >
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
    </g>
  );
}

export default FloatingErrorEdge;
