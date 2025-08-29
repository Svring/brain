import { useProjectState } from "@/contexts/project/project-context";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import _ from "lodash";

export const useSelectedResource = (
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  const { selectedResource } = useProjectState();

  const isSelected = selectedResource && _.isEqual(selectedResource, target);
  const shouldCreateChatSession = !selectedResource || !isSelected;

  return {
    selectedResource,
    isSelected,
    shouldCreateChatSession,
  };
};
