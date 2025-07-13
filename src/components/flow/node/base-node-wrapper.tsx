import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flow/components/base-node";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDeleteResourceMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { useRemoveFromProjectMutation } from "@/lib/app/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface BaseNodeProps {
  children: React.ReactNode;
  target: CustomResourceTarget | BuiltinResourceTarget;
  className?: string;
}

export default function BaseNodeWrapper({
  children,
  target,
  className,
}: BaseNodeProps) {
  const context = createK8sContext();
  const removeFromProjectMutation = useRemoveFromProjectMutation(context);
  const deleteResourceMutation = useDeleteResourceMutation(context);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode className={className}>
          <Handle position={Position.Top} type="source" />
          {children}
          <Handle position={Position.Bottom} type="target" />
        </BaseNode>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() =>
            removeFromProjectMutation.mutate({
              resources: [target],
            })
          }
        >
          Remove from project
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            deleteResourceMutation.mutate({
              target: target,
            })
          }
        >
          Delete resource
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
