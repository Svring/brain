"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { useChatState } from "@/contexts/chat/chat-context";

export function FlowgraphChatLoadingHint() {
  const { sidebarChatLoading } = useChatState();

  return (
    <AnimatePresence>
      {sidebarChatLoading && (
        <div className="absolute top-9 inset-x-0 z-20 pointer-events-none">
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.5 }}
              className="flex items-center gap-2 px-4 py-2 bg-background-tertiary backdrop-blur-lg rounded-lg border border-border-primary shadow-lg pointer-events-auto"
            >
              <Spinner size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Loading chat session...
              </span>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
