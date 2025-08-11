"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FloatingActionMenuProps = {
  options: {
    label: string;
    onClick: (e: Event) => void;
    Icon?: React.ReactNode;
  }[];
  className?: string;
};

const FloatingActionMenu = ({
  options,
  className,
}: FloatingActionMenuProps) => {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        <motion.div
          key="floating-menu"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.2,
          }}
        >
          <div className="flex flex-col items-start gap-2">
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={(e) => option.onClick(e as unknown as Event)}
                size="sm"
                className="flex items-center text-foreground gap-2 bg-background hover:bg-muted border border-muted shadow-[0_0_20px_rgba(0,0,0,0.2)] rounded-xl backdrop-blur-sm"
              >
                {option.Icon}
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionMenu;
