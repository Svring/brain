import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem(props: {
  id: string;
  data: any;
  children: React.ReactNode;
  dragHandle?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
    data: props.data,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Set up refs for drag handle
  const containerRef = React.useRef<HTMLElement | null>(null);
  const activatorRef = React.useRef<HTMLElement | null>(null);

  const combinedRef = React.useCallback(
    (node: HTMLElement | null) => {
      containerRef.current = node;
      setNodeRef(node);

      // If we have a drag handle selector, find the handle element
      if (props.dragHandle && node) {
        const handleElement = node.querySelector(
          props.dragHandle
        ) as HTMLElement;
        if (handleElement) {
          activatorRef.current = handleElement;
          setActivatorNodeRef(handleElement);
        }
      } else {
        // No drag handle specified, the entire container is draggable
        setActivatorNodeRef(node);
      }
    },
    [setNodeRef, setActivatorNodeRef, props.dragHandle]
  );

  // Only attach listeners to container if no drag handle is specified
  const containerProps = props.dragHandle
    ? { ...attributes }
    : { ...attributes, ...listeners };

  // Clone children and add drag handle listeners if needed
  const childrenWithProps = React.useMemo(() => {
    if (!props.dragHandle) {
      return props.children;
    }

    // For drag handle mode, we need to add listeners to the handle element
    // This is done through the activatorNodeRef mechanism
    return React.Children.map(props.children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          // Pass down drag handle listeners through a data attribute
          "data-drag-listeners": listeners,
        });
      }
      return child;
    });
  }, [props.children, props.dragHandle, listeners]);

  return (
    <div ref={combinedRef} style={style} {...containerProps}>
      {childrenWithProps}
    </div>
  );
}
