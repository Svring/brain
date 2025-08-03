"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const activateGeneralActions = () => {
  openProjectAction();
  gossipAction();
};

export const openProjectAction = () => {
  const router = useRouter();

  useCopilotAction({
    name: "openProject",
    description: "Open a specific project page",
    parameters: [
      {
        name: "projectName",
        type: "string",
        description: "The name of the project to open",
        required: true,
      },
    ],
    handler: async ({ projectName }) => {
      router.push(`projects/${projectName}`);
      return `Successfully opened project: ${projectName}`;
    },
  });
};

export const gossipAction = () => {
  useCopilotAction({
    name: "gossip",
    description: "Gossip with the user",
    parameters: [
      {
        name: "message",
        type: "string",
        description: "The message to gossip",
        required: true,
      },
    ],
    handler: ({ message }) => {
      toast(message, {
        duration: 5000,
      });
      return `Successfully gossiped: ${message}`;
    },
  });
};
