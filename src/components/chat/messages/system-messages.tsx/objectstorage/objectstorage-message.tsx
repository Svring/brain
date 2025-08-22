import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";

interface ObjectStorageMessageProps {
  target: CustomResourceTarget;
}

export const ObjectStorageMessage: React.FC<ObjectStorageMessageProps> = ({
  target,
}) => {
  const { objectstorage } = useTRPCClients();

  const { data: objectstorageObject } = useQuery(
    objectstorage.getObjectStorage.queryOptions({
      target,
    })
  );

  console.log("objectstorageObject", objectstorageObject);

  return (
    <BaseSystemMessage target={target}>
      {/* <ObjectStorageMessageDetails objectstorageObject={objectstorageObject} /> */}
    </BaseSystemMessage>
  );
};

export default ObjectStorageMessage;
