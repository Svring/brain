"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
interface EventMessageProps {
  target: any;
  payload?: any;
}

export const EventMessage: React.FC<EventMessageProps> = ({
  target,
  payload,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const message = payload?.message || "Event occurred";

  return (
    <div className="w-full">
      <div
        className={`border rounded-lg cursor-pointer hover:bg-muted/20 transition-all ${
          isExpanded ? "bg-muted/10" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center p-2">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex gap-2 ml-1 flex-1">
            <p className="text-sm text-muted-foreground">
              <span className="text-muted-foreground">Event:</span>{" "}
              <span className="text-foreground">{message}</span>
            </p>
          </div>
        </div>

        {isExpanded && payload?.createdAt && (
          <div className="px-2 pb-2 border-t border-muted/20">
            <div className="text-xs text-muted-foreground pt-2 flex items-center gap-2">
              <span className="mb-0">Timestamp:</span>
              <span className="font-mono">
                {new Date(payload.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
