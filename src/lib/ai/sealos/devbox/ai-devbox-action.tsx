"use client";

import { useQuery } from "@tanstack/react-query";
import { listDevboxOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { useCopilotAction } from "@copilotkit/react-core";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import { DevboxListCard } from "@/components/ai/action-cards/devbox-cards";

export const listDevboxAction = () => {
  const context = createDevboxContext();
  const { data } = useQuery(listDevboxOptions(context));

  useCopilotAction({
    name: "listDevbox",
    description: "Get the list of devboxes",
    handler: () => data,
    render: ({ status, result }) => {
      return <DevboxListCard devboxList={result} />;
    },
  });
};

export const activateDevboxActions = () => {
  listDevboxAction();
};
