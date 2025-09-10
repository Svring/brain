"use client";

import { useEffect, useRef } from "react";

interface FlowgraphOverlayProps {
  chatMaximized: boolean;
  selectedNodeId: string | null;
}

export function FlowgraphOverlay({ chatMaximized, selectedNodeId }: FlowgraphOverlayProps) {
  // Only show overlay when chat is maximized
  const dimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatMaximized) return;

    const updateClipPath = () => {
      const dimEl = dimRef.current;
      if (!dimEl) return;

      // If no selected node, no cutout; dim everything
      if (!selectedNodeId) {
        dimEl.style.clipPath = "none";
        return;
      }

      const container = dimEl.parentElement as HTMLElement | null;
      const nodeEl = document.querySelector(
        `[data-id="${selectedNodeId}"]`
      ) as HTMLElement | null;
      if (!container || !nodeEl) {
        dimEl.style.clipPath = "none";
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const nodeRect = nodeEl.getBoundingClientRect();

      const padding = 8; // visual breathing room
      const x = Math.max(0, nodeRect.left - containerRect.left - padding);
      const y = Math.max(0, nodeRect.top - containerRect.top - padding);
      const w = Math.min(
        nodeRect.width + padding * 2,
        containerRect.width - x
      );
      const h = Math.min(
        nodeRect.height + padding * 2,
        containerRect.height - y
      );

      // Create a rectangular cutout where the selected node sits
      // The polygon draws the outer rect, then a "hole" for the node rect
      const clipPath = `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${x}px ${y}px,
        ${x + w}px ${y}px,
        ${x + w}px ${y + h}px,
        ${x}px ${y + h}px
      )`;

      dimEl.style.clipPath = clipPath;
    };

    updateClipPath();
    const onResize = () => requestAnimationFrame(updateClipPath);
    window.addEventListener("resize", onResize);
    // Mutation observer in case RF reflows nodes (defensive)
    const mo = new MutationObserver(() => onResize());
    const root = dimRef.current?.parentElement;
    if (root) mo.observe(root, { subtree: true, attributes: true });

    return () => {
      window.removeEventListener("resize", onResize);
      mo.disconnect();
    };
  }, [chatMaximized, selectedNodeId]);

  if (!chatMaximized) return null;

  return (
    <>
      {/* Visual dim layer with a cutout around the selected node */}
      <div
        ref={dimRef}
        className="absolute inset-0 z-20 bg-black/40 transition-all duration-300 pointer-events-none"
      />
      {/* Transparent shield to block all interactions (including through the cutout) */}
      <div className="absolute inset-0 z-30 bg-transparent pointer-events-auto" />
    </>
  );
}
