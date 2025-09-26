import { useEffect } from "react";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { useReactFlow } from "@xyflow/react";

export const useFlowgraphFitView = () => {
  const { fitViewTrigger } = useFlowgraphState();
  const { fitView } = useReactFlow();

  // Handle fitView when trigger changes
  useEffect(() => {
    if (fitViewTrigger > 0) {
      // Small delay to ensure the layout has updated
      const timer = setTimeout(() => {
        fitView({
          padding: 0.2,
          duration: 300,
          maxZoom: 1,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [fitViewTrigger, fitView]);
};
