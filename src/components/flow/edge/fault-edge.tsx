import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  Position,
  MarkerType,
} from "@xyflow/react";
// import { useChatContext } from "@copilotkit/react-ui";

export default function FaultEdge(props: EdgeProps) {
  // const { setOpen } = useChatContext();
  const { id, sourceX, sourceY, targetX, targetY, markerEnd, style, data } =
    props;

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
  });

  const handleClick = (event: React.MouseEvent) => {
    // setOpen(true);
    if (data?.onClick && typeof data.onClick === "function") {
      data.onClick(event);
    }
  };

  return (
    <BaseEdge
      id={id}
      markerEnd={markerEnd}
      onClick={handleClick}
      path={path}
      style={style}
    />
  );
}
