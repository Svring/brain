"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { useRef, useState, useEffect, ReactNode } from "react";
import FloatingActionMenu from "@/components/flow/components/floating-action-menu";

interface HoverableNodeWrapperProps {
  children: ReactNode;
  menuOptions: {
    label: string;
    onClick: (e: Event) => void;
    Icon?: ReactNode;
  }[];
  onNodeMouseEnter?: () => void;
  onNodeMouseLeave?: () => void;
}

export default function HoverableNodeWrapper({
  children,
  menuOptions,
  onNodeMouseEnter,
  onNodeMouseLeave,
}: HoverableNodeWrapperProps) {
  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Menu visibility state
  const [menuState, setMenuState] = useState({
    isNodeHovered: false,
    isMenuHovered: false,
    isVisible: false,
  });

  // Event handlers
  const handleNodeMouseEnter = () => {
    setMenuState((prev) => ({ ...prev, isNodeHovered: true }));
    onNodeMouseEnter?.();
  };

  const handleNodeMouseLeave = () => {
    setMenuState((prev) => ({ ...prev, isNodeHovered: false }));
    onNodeMouseLeave?.();
  };

  const handleMenuMouseEnter = () =>
    setMenuState((prev) => ({ ...prev, isMenuHovered: true }));

  const handleMenuMouseLeave = () =>
    setMenuState((prev) => ({ ...prev, isMenuHovered: false }));

  // Menu visibility effect
  useEffect(() => {
    const { isNodeHovered, isMenuHovered } = menuState;

    if (isNodeHovered || isMenuHovered) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setMenuState((prev) => ({ ...prev, isVisible: true }));
    } else {
      timeoutRef.current = setTimeout(() => {
        setMenuState((prev) => ({ ...prev, isVisible: false }));
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [menuState.isNodeHovered, menuState.isMenuHovered]);

  return (
    <>
      <div
        onMouseEnter={handleNodeMouseEnter}
        onMouseLeave={handleNodeMouseLeave}
      >
        {children}
      </div>
      <NodeToolbar isVisible={menuState.isVisible} position={Position.Right}>
        <div
          ref={menuRef}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
          style={{
            position: "relative",
            minWidth: "200px",
            minHeight: "40px",
          }}
        >
          <FloatingActionMenu
            className="static bottom-auto right-auto"
            options={menuOptions}
          />
        </div>
      </NodeToolbar>
    </>
  );
}
