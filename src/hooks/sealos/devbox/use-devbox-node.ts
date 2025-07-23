"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listAllResourcesOptions,
  getCustomResourceOptions,
  getPodsByResourceTargetOptions,
  getSecretsByResourceTargetOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import { getDevboxRelatedResourcesOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import {
  DevboxNodeDataSchema,
  DevboxNodeData,
} from "@/lib/sealos/devbox/schemas/devbox-node-schemas";
import _ from "lodash";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { DEVBOX_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import {
  createK8sContext,
  spreadResourceList,
} from "@/lib/k8s/k8s-method/k8s-utils";
import {
  DevboxResourceK8sSchema,
  DevboxPodSchema,
  DevboxSecretSchema,
  DevboxIngressSchema,
} from "@/lib/sealos/devbox/schemas/devbox-k8s-schemas";
import { convertDevboxK8sToNodeData } from "@/lib/sealos/devbox/devbox-utils";

const useDevboxNode = (target: CustomResourceTarget) => {
  const context = createK8sContext();
  const devboxLabel = `${DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER}=${target.name}`;

  // Get the devbox custom resource
  const { data: resourceData } = useQuery({
    ...getCustomResourceOptions(context, target),
    select: (data) => DevboxResourceK8sSchema.parse(data),
  });
  const { data: podsData } = useQuery({
    ...getPodsByResourceTargetOptions(context, target),
    select: (data) => spreadResourceList(data),
  });
  const { data: secretsData } = useQuery({
    ...getSecretsByResourceTargetOptions(context, target),
    select: (data) =>
      DevboxSecretSchema.parse(_.first(spreadResourceList(data))),
  });
  const { data: ingressData } = useQuery({
    ...listAllResourcesOptions(context, devboxLabel, ["ingress"], []),
    select: (data) =>
      _.map(spreadResourceList(_.get(data, "builtin.ingress")), (item) =>
        DevboxIngressSchema.parse(item)
      ),
  });

  if (!resourceData || !podsData || !secretsData || !ingressData) {
    return {
      data: undefined,
      isLoading: true,
    };
  }

  const nodeData = convertDevboxK8sToNodeData(
    resourceData,
    podsData,
    secretsData,
    ingressData
  );

  return {
    data: nodeData,
    isLoading: false,
  };
};

export default useDevboxNode;
