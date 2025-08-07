import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { useQueryClient } from "@tanstack/react-query";
import {
  listProjectsOptions,
  getProjectResourcesOptions,
} from "@/lib/project/project-method/project-query";
import {
  useDeleteProjectMutation,
  useCreateProjectMutation,
} from "@/lib/project/project-method/project-mutation";
import { useCopilotAction } from "@copilotkit/react-core";

export const activateProjectActions = (context: K8sApiContext) => {
  listProjectAction(context);
  deleteProjectAction(context);
  getProjectResourcesAction(context);
  createProjectAction(context);
};

export const createProjectAction = (context: K8sApiContext) => {
  const createProject = useCreateProjectMutation(context);

  useCopilotAction({
    name: "createProject",
    description: "Create a new project",
    parameters: [
      {
        name: "projectName",
        type: "string",
        required: true,
        description: "Name of the project",
      },
      {
        name: "resources",
        type: "object[]",
        attributes: [
          {
            name: "resourceName",
            type: "string",
            required: true,
            description: "Name of the resource",
          },
          {
            name: "resourceKind",
            type: "string",
            enum: ["devbox", "cluster", "app", "objectstoragebucket"],
            required: true,
            description: "Type of the resource",
          },
          {
            name: "resourceType",
            type: "string",
            required: true,
            description:
              "Type of the resource, available values differ based on different resourceKind.",
          },
        ],
      },
    ],
    renderAndWaitForResponse(props) {
      return <></>;
    },
  });
};

export const listProjectAction = (context: K8sApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listProjects",
    description: "List all projects",
    handler: () => {
      return queryClient.fetchQuery(listProjectsOptions(context));
    },
  });
};

export const getProjectResourcesAction = (context: K8sApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getProjectResources",
    description: "Get all resources of a project",
    parameters: [
      {
        name: "projectName",
        type: "string",
        description: "Name of the project",
      },
    ],
    handler: ({ projectName }) => {
      return queryClient.fetchQuery(
        getProjectResourcesOptions(context, projectName)
      );
    },
  });
};

export const deleteProjectAction = (context: K8sApiContext) => {
  const deleteProject = useDeleteProjectMutation(context);

  useCopilotAction({
    name: "deleteProject",
    description: "Delete a project by its name.",
    parameters: [
      {
        name: "projectName",
        type: "string",
        description: "Name of the project to delete",
      },
    ],
    handler: ({ projectName }) => {
      deleteProject.mutateAsync({ projectName });
    },
  });
};
