import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
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
  } = useQuery(objectstorage.get.queryOptions(target));

  // console.log("objectstorageObject", objectstorageObject);

  // Handle loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading object storage information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Handle error state
  if (error || !objectstorageObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load object storage information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  return (
    <BaseResourceMessage
      target={target}
      headerSlot={<ObjectStorageMessageMenu target={target} />}
    >
      <ObjectStorageMessageDetails
        objectstorageObject={objectstorageObject as any}
      />
    </BaseResourceMessage>
  );
};

export default ObjectStorageMessage;
