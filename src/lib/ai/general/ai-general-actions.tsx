"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";

export const activateGeneralActions = () => {
  openProjectAction();
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
      router.push(`project/${projectName}`);
      return `Successfully opened project: ${projectName}`;
    },
  });
};
