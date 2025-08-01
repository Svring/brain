"use client";

import React from "react";
import { Box } from "lucide-react";

interface Pod {
  name: string;
  status: string;
}

interface NodePodsProps {
  pods?: Pod[];
}

export default function NodePods({ pods = [] }: NodePodsProps) {
  const getStatusColor = () => {
    if (pods.length === 0) {
      return "text-muted-foreground";
    }
    
    const hasError = pods.some(pod => pod.status.toLowerCase() === "error");
    if (hasError) {
      return "text-theme-red";
    }
    
    const allRunning = pods.every(pod => pod.status.toLowerCase() === "running");
    if (allRunning) {
      return "text-theme-green";
    }
    
    return "text-theme-gray";
  };

  return (
    <div className="p-1 border-2 border-muted-foreground/20 rounded-full">
      <Box className={`h-4 w-4 ${getStatusColor()}`} />
    </div>
  );
}