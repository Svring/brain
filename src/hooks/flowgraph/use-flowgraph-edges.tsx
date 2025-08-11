import { useMemo } from "react";
import { convertReliancesToEdges } from "@/lib/flowgraph/edges/flowgraph-edges-utils";

export default function useFlowgraphEdges(reliances: any) {
  const edges = useMemo(() => {
    return convertReliancesToEdges(reliances);
  }, [reliances]);

  return { edges };
}
