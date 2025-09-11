import React, { useState } from "react";
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  MarkerType,
  useInternalNode,
} from "@xyflow/react";

import { getEdgeParams } from "@/lib/flowgraph/edges/flowgraph-edges-utils";

function FloatingEdge(props: EdgeProps) {
  const { id, source, target, markerEnd, style } = props;
  const [isHovered, setIsHovered] = useState(false);

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const edgeStyle = {
    stroke: isHovered ? "var(--color-theme-blue)" : "hsl(var(--primary))",
    strokeWidth: isHovered ? 1.5 : 1,
    transition: "all 0.2s ease-in-out",
    ...style,
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

export default FloatingEdge;
