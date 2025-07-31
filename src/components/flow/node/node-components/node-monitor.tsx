"use client";

import React from "react";
import { Activity } from "lucide-react";

export default function NodeMonitor() {
  return (
    <div className="p-1 border-2 border-muted-foreground/20 rounded-full">
      <Activity className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}