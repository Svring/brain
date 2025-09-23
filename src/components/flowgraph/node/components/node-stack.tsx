"use client";

import { ReactNode, useState } from "react";
import BaseNode from "../base-node-wrapper";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ResourceView } from "@/contexts/navigation/navigation-machine";

interface NodeStackProps {
  mainCard: ReactNode;
  data: any[]; // Array of data to create background cards
  height?: string;
  maxBackgroundCards?: number; // Maximum number of background cards (default: 5)
  backgroundColor?: string; // Background color class for the main card
  notReadyCount?: number; // Number of cards that are not ready (for yellow coloring)
  onBackgroundCardClick?: (index: number, data: any) => void; // Optional click handler for background cards
  // BaseNode parameters for background cards
  target: ResourceTarget;
  messageType?: string;
  nodeId: any; // Added nodeId to the interface
  width?: "auto" | "fixed"; // Width setting for adaptive sizing
  view?: ResourceView; // View parameter for background cards
}

export default function NodeStack({
  mainCard,
  data,
  height,
  maxBackgroundCards = 2,
  backgroundColor,
  notReadyCount = 0,
  onBackgroundCardClick,
  target,
  messageType,
  nodeId,
  width = "fixed",
  view,
}: NodeStackProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate how many background cards to show (limited by maxBackgroundCards)
  const backgroundCardCount = Math.min(data.length, maxBackgroundCards);

  // Generate background cards with incremental offsets
  const backgroundCards = Array.from(
    { length: backgroundCardCount },
    (_, index) => {
      const offset = (index + 1) * 6; // Incremental offset: 8px, 16px, 24px, etc.
      const rotationAngle = (index + 1) * -3; // Incremental rotation: -5°, -10°, -15°, etc.

      // Determine background color for this card
      // Apply yellow background to the first 'notReadyCount' cards
      const cardBackgroundColor =
        index < notReadyCount ? "bg-status-warning" : backgroundColor;

      return (
        <div
          key={index}
          className="absolute inset-0 cursor-pointer transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${offset}px, -${offset}px) rotate(${
              isHovered ? rotationAngle : 0
            }deg)`,
            transformOrigin: "top left",
            zIndex: backgroundCardCount - index, // Inverted z-index: higher index = lower z-index
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Call the provided click handler if available
            if (onBackgroundCardClick) {
              onBackgroundCardClick(index, data[index]);
            }
          }}
        >
          <BaseNode
            nodeId={nodeId}
            target={target}
            messageType={messageType}
            className={`${height ? `h-${height}` : ""} ${
              cardBackgroundColor || ""
            }`}
            width={width}
            view={view}
          >
            {/* Empty content for background cards */}
            <div className="w-full h-full" />
          </BaseNode>
        </div>
      );
    }
  );

  return (
    <div
      className={`relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background cards with incremental offsets */}
      {backgroundCards}

      {/* Front card (main component) */}
      <div
        style={{
          zIndex: backgroundCardCount,
          position: "relative",
        }}
        className="cursor-default"
      >
        {mainCard}
      </div>
    </div>
  );
}
