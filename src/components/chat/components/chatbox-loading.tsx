"use client";

import { AiChatHeader } from "./header";
import { AiChatInput } from "./input";
import { cn } from "@/lib/utils";

export default function AiChatboxLoading() {
  return (
    <div
      className={cn(
        "h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100 translate-x-0 opacity-100"
      )}
    >
      <AiChatHeader />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {/* Loading state indicator */}
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-blue"></div>
            <div className="text-sm">Loading chat...</div>
          </div>
        </div>
      </div>

      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput 
            onSubmit={() => {}} 
            onStop={() => {}} 
            isLoading={true} 
          />
        </div>
      </div>
    </div>
  );
}
