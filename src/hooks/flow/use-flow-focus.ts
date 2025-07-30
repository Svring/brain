import { useCallback } from 'react';
import { useReactFlow, useOnSelectionChange } from '@xyflow/react';
import { useFlowState } from '@/contexts/flow/flow-context';

/**
 * Custom hook for auto-focusing on selected nodes in ReactFlow
 * Centers the selected node in the left 60% of the screen
 * Also provides onNodeClick handler for triggering selection
 */
export function useFlowFocus() {
  const { setCenter, getViewport } = useReactFlow();
  const { isDragging } = useFlowState();

  // Auto-focus on selected node in the left 60% of the screen
  const onChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: any[] }) => {
      // Don't focus if currently dragging
      if (isDragging || selectedNodes.length !== 1) {
        return;
      }

      const selectedNode = selectedNodes[0];
      const viewport = getViewport();

      // Adjust to position in left 60% center
      setTimeout(() => {
        const currentViewport = getViewport();
        const offsetX = (window.innerWidth * 0.28) / currentViewport.zoom; // 20% offset to center in left 60%
        const offsetY = (window.innerHeight * 0.1) / currentViewport.zoom; // 20% offset to center in left 60%
        setCenter(
          selectedNode.position.x + offsetX,
          selectedNode.position.y + offsetY,
          {
            duration: 200,
            zoom: 1.0,
          }
        );
      }, 100);
    },
    [setCenter, getViewport, isDragging]
  );

  useOnSelectionChange({
    onChange,
  });

  // Handle node click to trigger selection
  const onNodeClick = useCallback((_event: any, node: any) => {
    // Don't trigger focus if currently dragging
    if (isDragging) {
      return;
    }
    // This will trigger the selection change which the onChange callback listens to
    onChange({ nodes: [{ ...node, selected: true }] });
  }, [onChange, isDragging]);

  return { onNodeClick };
}