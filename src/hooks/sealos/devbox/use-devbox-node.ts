"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCustomResourceOptions,
  getPodsByResourceTargetOptions,
  getSecretsByResourceTargetOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import { getDevboxRelatedResources } from "@/lib/algorithm/relevance/devbox-relevance";
import {
  DevboxNodeDataSchema,
  DevboxNodeData,
} from "@/lib/sealos/devbox/schemas/devbox-node-schemas";
import _ from "lodash";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { DevboxResourceK8sSchema } from "@/lib/sealos/devbox/schemas/devbox-k8s-schemas";
import { convertDevboxK8sToNodeData } from "@/lib/sealos/devbox/devbox-utils";

const useDevboxNode = async (target: CustomResourceTarget) => {
  const context = createK8sContext();

  // Get the devbox custom resource
  const { data: devboxResource } = useQuery(
    getCustomResourceOptions(context, target)
  );
  const devboxResourceK8s = DevboxResourceK8sSchema.parse(devboxResource);
  const devboxNodeData = convertDevboxK8sToNodeData(devboxResourceK8s);

  console.log("devboxNodeData", devboxNodeData);

  // Get pods owned by this devbox
  const { data: podsData } = useQuery(
    getPodsByResourceTargetOptions(context, target)
  );

  // Get secrets owned by this devbox
  const { data: secretsData } = useQuery(
    getSecretsByResourceTargetOptions(context, target)
  );

  // Get other devbox related resources
  const devboxRelatedResources = await getDevboxRelatedResources(
    context,
    target.name ? target.name : ""
  );
};

export default useDevboxNode;
