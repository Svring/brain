"use client";

import { useEffect, useState } from "react";
import { useDisclosure } from "@reactuses/core";

export function useFlowgraphCommand() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+M (Mac) or Ctrl+M (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpen]);

  return {
    isOpen,
    onOpen,
    onClose,
    onOpenChange,
  };
}
