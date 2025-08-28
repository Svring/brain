"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddResourcePreview } from "./command-panel-add-resource";

interface CommandDetailsProps {
  command: string;
  onExecute: (value: string) => void;
  onBack: () => void;
}

export function CommandDetails({
  command,
  onExecute,
  onBack,
}: CommandDetailsProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AddResourcePreview onSelect={onExecute} autoFocus={true} />
      </div>
    </div>
  );
}
