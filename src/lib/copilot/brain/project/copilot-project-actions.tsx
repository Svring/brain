import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { useQueryClient } from "@tanstack/react-query";
import {
  listProjectsOptions,
  getProjectResourcesOptions,
} from "@/lib/brain/resources/project/project-method/project-query";
import {
  useDeleteProjectMutation,
  useCreateProjectMutation,
} from "@/lib/brain/resources/project/project-method/project-mutation";
import { useCopilotAction } from "@copilotkit/react-core";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";

export const activateProjectActions = (context: K8sApiContext) => {
  listProjectAction(context);
  deleteProjectAction(context);
  getProjectResourcesAction(context);
  proposeProjectAction(context);
  // createProjectAction(context);
};

export const proposeProjectAction = (context: K8sApiContext) => {
  useCopilotAction({
    name: "propose_project",
    // available: "disabled",
    render: ({ status, args, result }) => {
      console.log("proposeProjectAction", status, args, result);
      return (
        <AITool key="propose_project">
          <AIToolHeader
            status={status}
            name="Propose Project"
            description="Propose a new project based on the provided requirements."
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

// export const createProjectAction = (context: K8sApiContext) => {
//   const createProject = useCreateProjectMutation(context);

//   useCopilotAction({
//     name: "createProject",
//     description: "Create a new project",
//     parameters: [
//       {
//         name: "projectName",
//         type: "string",
//         required: true,
//         description: "Name of the project",
//       },
//       {
//         name: "resources",
//         type: "object[]",
//         attributes: [
//           {
//             name: "resourceName",
//             type: "string",
//             required: true,
//             description: "Name of the resource",
//           },
//           {
//             name: "resourceKind",
//             type: "string",
//             enum: ["devbox", "cluster", "app", "objectstoragebucket"],
//             required: true,
//             description: "Type of the resource",
//           },
//           {
//             name: "resourceType",
//             type: "string",
//             required: true,
//             description:
//               "Type of the resource, available values differ based on different resourceKind.",
//           },
//         ],
//       },
//     ],
//     // handler: ({ name, resources }) => {
//     //   createProject.mutateAsync({ name, resources });
//     // },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"createProject"}>
//           <AIToolHeader
//             description={"Create a new project"}
//             name={"createProject"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// };

export const listProjectAction = (context: K8sApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listProjects",
    description: "List all projects",
    handler: () => {
      return queryClient.fetchQuery(listProjectsOptions(context));
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"listProjects"}>
          <AIToolHeader
            description={"List all projects"}
            name={"listProjects"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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
        name: "name",
        type: "string",
        required: true,
        description: "Name of the project",
      },
    ],
    handler: ({ name }) => {
      return queryClient.fetchQuery(getProjectResourcesOptions(context, name));
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"getProjectResources"}>
          <AIToolHeader
            description={"Get all resources of a project"}
            name={"getProjectResources"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
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
        name: "name",
        type: "string",
        required: true,
        description: "Name of the project to delete",
      },
    ],
    handler: ({ name }) => {
      // deleteProject.mutateAsync({ name: name });
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deleteProject"}>
          <AIToolHeader
            description={"Delete a project by its name"}
            name={"deleteProject"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};
