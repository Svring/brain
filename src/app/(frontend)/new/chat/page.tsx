"use client";

import { Hero } from "@/components/chat/hero";
import { AiChatInput } from "@/components/ai/headless/ai-input";
import { AiMessages } from "@/components/ai/headless/ai-messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  getBrainProject,
  listBrainProjects,
} from "@/lib/brain/brain-methods/brain-query";
import { useEffect } from "react";
import { createK8sContext } from "@/lib/auth/auth-utils";

export default function ChatPage() {
  const { messages } = useCopilotChatHeadless_c({ id: "chat" });
  const hasMessages = messages.length > 0;
  const router = useRouter();

  const handleCreateFromTemplate = () => {
    router.push("/new/template");
  };

  const k8sContext = createK8sContext();

  // useEffect(() => {
  //   listBrainProjects(k8sContext).then((res) => {
  //     console.log(res);
  //   });
  // }, []);

  return (
    <div className="h-screen w-full flex flex-col">
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          // Initial state: Hero + centered input
          <motion.div
            key="hero-state"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-screen"
          >
            <Hero
              heroTitle="Seaward"
              subtitle="We have lingered in the chambers of the sea. By sea-girls wreathed with seaweed red and brown."
              titleClassName="text-5xl md:text-6xl font-extrabold"
              subtitleClassName="text-lg md:text-xl max-w-[600px]"
              actionsClassName="mt-4"
              actions={[
                {
                  variant: "default",
                  label: "Create From Template",
                  onClick: handleCreateFromTemplate,
                },
              ]}
            />
            <div className="container mx-auto px-4 py-8">
              <AiChatInput className="max-w-3xl mx-auto" />
            </div>
          </motion.div>
        ) : (
          // Chat state: Scrollable messages + fixed bottom input
          <motion.div
            key="chat-state"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col min-h-screen"
          >
            {/* Messages area - scrollable */}
            <div className="flex-1 overflow-y-auto pt-8 pb-4">
              <div className="max-w-3xl mx-auto">
                <AiMessages />
              </div>
            </div>

            {/* Input fixed at bottom */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="sticky bottom-0 bg-background/95 backdrop-blur z-10 pb-8"
            >
              <div className="container mx-auto px-4">
                <AiChatInput className="max-w-3xl mx-auto" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
