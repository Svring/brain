"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const activateGeneralActions = () => {
  openProjectAction();
  redirectAction();
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

export const redirectAction = () => {
  const router = useRouter();

  useCopilotAction({
    name: "redirect",
    description: "Redirect to a specific page",
    parameters: [
      {
        name: "path",
        type: "string",
        enum: ["projects", "chat"],
        description: "The path to redirect to",
        required: true,
      },
    ],
    handler: async ({ path }) => {
      router.push(`/${path}`);
      return `Successfully redirected to: ${path}`;
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
