"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listDevboxOptions,
  getDevboxOptions,
} from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { useCopilotAction } from "@copilotkit/react-core";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";

export const listDevboxAction = () => {
  const context = createDevboxContext();
  const { data } = useQuery(listDevboxOptions(context));

  useCopilotAction({
    name: "listDevbox",
    description: "Get the list of devboxes",
    handler: () => data,
  });
};

export const getDevboxAction = () => {
  const context = createDevboxContext();
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getDevbox",
    description: "Get the devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description:
          "The name of the devbox to get. Can be a single devbox name or array of devbox names.",
        required: true,
      },
    ],
    handler: async ({ devboxName }) => {
      return await queryClient.fetchQuery(
        getDevboxOptions(context, devboxName)
      );
    },
  });
};

export const activateDevboxActions = () => {
  listDevboxAction();
  getDevboxAction();
};
