"use client";

import { motion } from "framer-motion";
import { useHover } from "@reactuses/core";
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
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  const [isMainInFront, setIsMainInFront] = useState(showMainFirst);

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
    <div ref={ref} className={`relative ${className}`}>
      {/* Background card */}
      <motion.div
        className="absolute inset-0 cursor-pointer"
        style={{
          transform: "translate(2px, 2px)",
          zIndex: 0,
        }}
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{
          opacity: hovered ? 0.8 : 0.6,
          y: hovered ? -30 : -10,
          x: hovered ? 20 : 10,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={handleBackCardClick}
      >
        <div className="bg-transparent rounded-xl shadow-sm h-full w-full">
          {backCard}
        </div>
      </motion.div>

      {/* Front card */}
      <motion.div
        initial={{ y: 0 }}
        style={{
          zIndex: 1,
          transform: "translate(0, 0)",
        }}
        animate={{
          y: 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="cursor-default"
      >
        {frontCard}
      </motion.div>
    </div>
  );
}
