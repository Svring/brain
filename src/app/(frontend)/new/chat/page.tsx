"use client";

import { Hero } from "@/components/ui/hero";
import { AiChatInput } from "@/components/chat/ai-input";
import { AiMessages } from "@/components/chat/ai-messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import useCopilotActions from "@/hooks/copilot/use-copilot-actions";

import { createSealosContext } from "@/lib/auth/auth-utils";
import {
  getClusterVersions,
  getCluster,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api";
import { useEffect } from "react";
import { runParallelAction } from "next-server-actions-parallel";
import { useLanggraphAgentNewProject } from "@/hooks/langgraph/use-langgraph-agent";

export default function ChatPage() {
  const { messages } = useCopilotChatHeadless_c();
  const hasMessages = messages.length > 0;
  const router = useRouter();

  const context = createSealosContext();

  useCopilotActions();
  const newProjectAgent = useLanggraphAgentNewProject();

  // useEffect(() => {
  //   const fetchClusterVersions = async () => {
  //     const clusterVersions = await runParallelAction(getClusterVersions(context));
  //     const cluster = await runParallelAction(getCluster("affine-kssnwpeh-pg", context));
  //     console.log(clusterVersions);
  //     console.log(cluster);
  //   };
  //   fetchClusterVersions();
  // }, []);

  return (
    <div className="relative h-screen w-full flex flex-col">
      {/* Hero overlays the content area and fades out when messages exist */}
      <motion.div
        initial={!hasMessages ? { opacity: 0, y: 0 } : false}
        animate={{ opacity: hasMessages ? 0 : 1, y: hasMessages ? -20 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`absolute inset-0 flex flex-col ${
          hasMessages ? "pointer-events-none" : ""
        }`}
      >
        <Hero
          heroTitle="Sealos Brain"
          subtitle=""
          titleClassName="text-5xl md:text-6xl font-extrabold"
          subtitleClassName="text-lg md:text-xl max-w-[600px]"
          actionsClassName="mt-4"
          // actions={[
          //   {
          //     variant: "default",
          //     label: "Create From Template",
          //     onClick: () => {
          //       router.push("/new/template");
          //     },
          //   },
          // ]}
        />
      </motion.div>

      {/* Messages area becomes visible once there are messages */}
      {hasMessages && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto pt-8 pb-4">
            <div className="max-w-3xl mx-auto">
              <AiMessages />
            </div>
          </div>
        </div>
      )}

      {/* Single persistent input: animates from center to sticky bottom */}
      <motion.div
        layout
        initial={!hasMessages ? { y: 0, opacity: 0 } : false}
        animate={{ y: hasMessages ? 0 : 60, opacity: 1 }}
        transition={{
          delay: hasMessages ? 0 : 0.3,
          duration: hasMessages ? 0.4 : 0.8,
          ease: "easeOut",
        }}
        className={
          hasMessages
            ? "sticky bottom-0 bg-background/95 backdrop-blur z-10 pb-8"
            : "absolute inset-x-0 top-1/2 -translate-y-1/2"
        }
      >
        <div className="container mx-auto px-4">
          <AiChatInput className="max-w-3xl mx-auto" />
        </div>
      </motion.div>
    </div>
  );
}
