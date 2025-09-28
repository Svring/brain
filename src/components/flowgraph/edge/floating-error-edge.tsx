import React, { useState, useMemo, memo } from "react";
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  useInternalNode,
  EdgeLabelRenderer,
} from "@xyflow/react";

import { getEdgeParams } from "@/lib/flowgraph/edges/flowgraph-edges-utils";
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


  const { edgePath, labelX, labelY } = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return { edgePath: '', labelX: 0, labelY: 0 };
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
      sourceNode,
      targetNode
    );

    const [path, lx, ly] = getBezierPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      targetX: tx,
      targetY: ty,
    });

    return { edgePath: path, labelX: lx, labelY: ly };
  }, [
    sourceNode?.internals.positionAbsolute?.x,
    sourceNode?.internals.positionAbsolute?.y,
    targetNode?.internals.positionAbsolute?.x,
    targetNode?.internals.positionAbsolute?.y
  ]);

  if (!sourceNode || !targetNode || !resourceTarget) {
    return null;
  }

  const errorColor = "#9F833B";

  const edgeStyle = {
    stroke: errorColor,
    strokeWidth: isHovered ? 2 : 1.5,
    strokeDasharray: "5,5",
    transition: "all 0.2s ease-in-out",
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

export default memo(FloatingErrorEdge);
