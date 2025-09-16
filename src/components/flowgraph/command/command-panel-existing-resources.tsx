"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExistingResourcesProps {
  onBack: () => void;
}

export function ExistingResources({ onBack }: ExistingResourcesProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold">Add Existing Resources</h2>
              <p className="text-sm text-muted-foreground">
                Coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium">Feature Coming Soon</p>
            <p className="text-sm">
              This feature will allow you to add existing resources to your project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
