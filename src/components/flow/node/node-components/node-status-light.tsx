import React from "react";
import { Square } from "lucide-react";

interface NodeStatusLightProps {
  status: string;
  className?: string;
}

export default function NodeStatusLight({ status, className = "" }: NodeStatusLightProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Square
        className={`h-3 w-3 ${
          status === "Running"
            ? "fill-theme-green text-theme-green"
            : status === "Stopped"
            ? "fill-theme-purple text-theme-purple"
            : status === "Pending"
            ? "fill-theme-gray text-theme-gray"
            : status === "Shutdown"
            ? "fill-theme-purple text-theme-purple"
            : status === "Error"
            ? "fill-theme-red text-theme-red"
            : "fill-theme-gray text-theme-gray"
        }`}
      />
      <span className="text-sm text-center">{status}</span>
    </div>
  );
}