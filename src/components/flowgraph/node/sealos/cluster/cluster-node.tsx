"use client";

import BaseNode from "../../base-node-wrapper";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy } from "lucide-react";
import NodeStatusLight from "../node-components/node-status-light";
import NodeInternalUrl from "../node-components/node-internal-url";
import NodeMonitor from "../node-components/node-monitor";
import NodePods from "../node-components/node-pods";
import NodeStack from "../node-components/node-stack";
import ClusterNodeTitle from "./cluster-node-title";
import ClusterNodeMenu from "./cluster-node-menu";
import ClusterNodeBackup from "./cluster-node-backup";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useChatActions } from "@/contexts/chat/chat-context";
import { randomId } from "@copilotkit/shared";

export default function ClusterNode({ data }: { data: ClusterObject }) {
  const [publicAccess, setPublicAccess] = useState(false);
  const { sendMessage } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();

  const { name, type, status, pods } = data;

  const handleNodeClick = () => {
    // Send a message about the cluster
    sendMessage({
      id: randomId(),
      role: "user",
      content: `Tell me about the cluster ${name} of type ${type}. What can I do with it?`,
    });
    // Open the sidebar chat
    openSidebarChat();
  };

  const mainCard = (
    <BaseNode nodeData={data}>
      <div className="flex h-full flex-col gap-4 justify-between">
        {/* Header with Name and Menu */}
        <div className="flex items-center justify-between">
          <ClusterNodeTitle name={name} type={type} />
          <div className="flex-shrink-0">
            <ClusterNodeMenu object={data} />
          </div>
        </div>

        {/* Public Access Toggle and Copy Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Public Access</span>
            <Switch
              checked={publicAccess}
              onCheckedChange={setPublicAccess}
              className="scale-75"
            />
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
            }}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status!} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            <NodeInternalUrl ports={[]} />
            <NodePods pods={pods} />
            <NodeMonitor />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  const subCard = <ClusterNodeBackup object={data} />;

  return <NodeStack mainCard={mainCard} subCard={subCard} />;
}
