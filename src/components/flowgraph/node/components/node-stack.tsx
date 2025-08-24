"use client";

import { useRef, ReactNode, useState } from "react";
import BaseNode from "../base-node-wrapper";

interface NodeStackProps {
  mainCard: ReactNode;
  data: any[]; // Array of data to create background cards
  height?: string;
  maxBackgroundCards?: number; // Maximum number of background cards (default: 5)
  backgroundColor?: string; // Background color class for the main card
}

export default function NodeStack({
  mainCard,
  data,
  height,
  maxBackgroundCards = 2,
  backgroundColor,
}: NodeStackProps) {
  // Calculate how many background cards to show (limited by maxBackgroundCards)
  const backgroundCardCount = Math.min(data.length, maxBackgroundCards);

  // Generate background cards with incremental offsets
  const backgroundCards = Array.from(
    { length: backgroundCardCount },
    (_, index) => {
      const offset = (index + 1) * 8; // Incremental offset: 8px, 16px, 24px, etc.
      return (
        <div
          key={index}
          className="absolute inset-0 cursor-pointer"
          style={{
            transform: `translate(${offset}px, -${offset}px)`,
            zIndex: backgroundCardCount - index, // Inverted z-index: higher index = lower z-index
          }}
          onClick={(e) => {
            e.stopPropagation();
            // You can add custom click handling for each background card here
          }}
        >
          <BaseNode
            nodeData={{}}
            className={`${height ? `h-${height}` : ""} ${
              backgroundColor || ""
            }`}
            active={false}
          >
            {/* Empty content for background cards */}
            <div className="w-full h-full" />
          </BaseNode>
        </div>
      );
    }
  );

  return (
    <div className={`relative`}>
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
