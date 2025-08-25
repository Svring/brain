import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/message-actions";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Pencil } from "lucide-react";
import ObjectStorageMessageDetails from "./components/objectstorage-message-details";
import ObjectStorageMessageMenu from "./components/objectstorage-message-menu";

interface ObjectStorageMessageProps {
  target: CustomResourceTarget;
}

export const ObjectStorageMessage: React.FC<ObjectStorageMessageProps> = ({
  target,
}) => {
  const { objectstorage } = useTRPCClients();
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const {
    data: objectstorageObject,
    isLoading,
    error,
  } = useQuery(
    objectstorage.getObjectStorage.queryOptions({
      target,
    })
  );

  // console.log("objectstorageObject", objectstorageObject);

  const actions: MessageAction[] = objectstorageObject
    ? [
        {
          icon: Pencil,
          label: "Update",
          onClick: () => {
            appendSystemMessage("objectstorage.update", target);
          },
        },
      ]
    : [];

  // Handle loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading object storage information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Handle error state
  if (error || !objectstorageObject) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load object storage information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage
      target={target}
      actions={actions}
      headerSlot={<ObjectStorageMessageMenu target={target} />}
    >
      <ObjectStorageMessageDetails
        objectstorageObject={objectstorageObject as any}
      />
    </BaseSystemMessage>
  );
};

export default ObjectStorageMessage;
