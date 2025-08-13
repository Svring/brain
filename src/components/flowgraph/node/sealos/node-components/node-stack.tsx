"use client";

import { useRef, ReactNode, useState } from "react";

interface NodeStackProps {
  mainCard: ReactNode;
  subCard: ReactNode;
  className?: string;
  showMainFirst?: boolean;
  onSubCardClick?: () => void;
}

export default function NodeStack({
  mainCard,
  subCard,
  className = "",
  showMainFirst = true,
  onSubCardClick,
}: NodeStackProps) {
  const [isMainInFront, setIsMainInFront] = useState(showMainFirst);
  const [isHovered, setIsHovered] = useState(false);

  const frontCard = isMainInFront ? mainCard : subCard;
  const backCard = isMainInFront ? subCard : mainCard;

  const handleBackCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMainInFront && onSubCardClick) {
      onSubCardClick();
    } else {
      setIsMainInFront(!isMainInFront);
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background card with animated offset */}
      <div
        className="absolute inset-0 cursor-pointer transition-transform duration-200 ease-out"
        style={{
          transform: isHovered ? "translate(20px, -20px)" : "translate(12px, -12px)",
          zIndex: 0,
        }}
        onClick={handleBackCardClick}
      >
        <div className="bg-transparent rounded-xl shadow-sm h-full w-full">
          {backCard}
        </div>
      </div>

      {/* Front card */}
      <div
        style={{
          zIndex: 1,
          position: "relative",
        }}
        className="cursor-default"
      >
        {frontCard}
      </div>
    </div>
  );
}
