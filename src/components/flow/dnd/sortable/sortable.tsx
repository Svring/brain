import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem(props: {
  id: string;
  data: any;
  children: React.ReactNode;
  dragHandle?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.id,
      data: props.data,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // If dragHandle is specified, we'll handle the listeners differently
  const nodeRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (props.dragHandle && nodeRef.current && listeners) {
      const handleElement = nodeRef.current.querySelector(props.dragHandle);
      if (handleElement) {
        // Apply listeners to the handle element
        Object.entries(listeners).forEach(([eventName, handler]) => {
          if (typeof handler === "function") {
            const eventType = eventName.replace("on", "").toLowerCase();
            handleElement.addEventListener(eventType, handler as EventListener);
          }
        });

        return () => {
          Object.entries(listeners).forEach(([eventName, handler]) => {
            if (typeof handler === "function") {
              const eventType = eventName.replace("on", "").toLowerCase();
              handleElement.removeEventListener(
                eventType,
                handler as EventListener
              );
            }
          });
        };
      }
    }
  }, [props.dragHandle, listeners]);

  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  // If dragHandle is specified, don't attach listeners to the container
  const containerListeners = props.dragHandle ? {} : listeners;

  return (
    <div ref={handleRef} style={style} {...attributes} {...containerListeners}>
      {props.children}
    </div>
  );
}
