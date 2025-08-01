import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listProjectsOptions,
  getProjectOptions,
} from "@/lib/project/project-method/project-query";
import { useCopilotAction } from "@copilotkit/react-core";

export const activateProjectActions = (context: K8sApiContext) => {
  listProjectAction(context);
};

export const createProjectAction = async () => {};

export const listProjectAction = (context: K8sApiContext) => {
  const { data: projects } = useQuery(listProjectsOptions(context));

  useCopilotAction({
    name: "listProject",
    description: "List all projects",
    parameters: [],
    handler: () => {
      return projects;
    },
  });
};

export const getProjectAction = (
  context: K8sApiContext,
  projectName: string
) => {
  return useQuery(getProjectOptions(context, projectName));
};

export const deleteProjectAction = async () => {};

export const updateProjectAction = async () => {};
