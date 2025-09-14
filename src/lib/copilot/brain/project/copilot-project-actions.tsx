import { useCopilotAction } from "@copilotkit/react-core";
import {
  ProjectProposal,
  ProjectProposalSchema,
  ProjectResourcesSchema,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { ProjectProposalPresentation } from "@/components/chat/state-cards/project-proposal/project-proposal-presentation";
import { ProjectLogsActionMessage } from "@/components/copilot/brain/project/project-logs-action-message";
import { AddResourceToProjectActionMessage } from "@/components/copilot/brain/project/add-resource-to-project-action-message";
import { useFlowgraphResources } from "@/hooks/flowgraph/use-flowgraph-resources";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient } from "@tanstack/react-query";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { CircleCheckBigIcon } from "lucide-react";

export const activateProjectActions = () => {
  proposeProjectAction();
  addResourceToProjectAction();
  getProjectResourcesAction();
  // checkAllLogsAction();
};

export const proposeProjectAction = () => {
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "propose_project",
    available: stage === "propose_project" ? "enabled" : "disabled",
    render: ({ result }) => {
      if (!result) return <div />;
      try {
        // Always parse with schema for validation
        const proposal =
          typeof result === "object" && result !== null
            ? ProjectProposalSchema.parse(result)
            : ProjectProposalSchema.parse(JSON.parse(result as string));
        return <ProjectProposalPresentation proposal={proposal} />;
      } catch (error) {
        console.error("Failed to parse project proposal:", error);
        return <div />;
      }
    },
  });
};

export const addResourceToProjectAction = () => {
  const { stage } = useLanggraphState();
  const { selectedProject } = useProjectState();
  useCopilotAction({
    name: "add_resource_to_project",
    available: stage === "manage_project" ? "enabled" : "disabled",
    description:
      "Add resources (devbox, database, bucket, app) to the currently selected project",
    parameters: [
      {
        name: "devbox",
        type: "object[]",
        required: false,
        description: "Array of devbox resources to add",
        attributes: [
          {
            name: "name",
            type: "string",
            required: true,
            description:
              "Devbox name (lowercase, numbers, underscores, hyphens only, max 24 chars)",
          },
          {
            name: "runtime",
            type: "string",
            required: true,
            description: "Devbox runtime",
            enum: [
              "nuxt3",
              "angular",
              "quarkus",
              "ubuntu",
              "flask",
              "java",
              "chi",
              "net",
              "iris",
              "hexo",
              "python",
              "docusaurus",
              "vitepress",
              "cpp",
              "vue",
              "nginx",
              "rocket",
              "debian-ssh",
              "vert.x",
              "express.js",
              "django",
              "next.js",
              "sealaf",
              "go",
              "react",
              "php",
              "svelte",
              "c",
              "astro",
              "umi",
              "gin",
              "echo",
              "rust",
            ],
          },
          {
            name: "ports",
            type: "object[]",
            required: false,
            description: "Array of ports to expose",
            attributes: [
              {
                name: "number",
                type: "number",
                required: true,
                description: "Port number (1-65535)",
              },
              {
                name: "publicAccess",
                type: "boolean",
                required: true,
                description: "Whether the port should be publicly accessible",
              },
            ],
          },
        ],
      },
      {
        name: "database",
        type: "object[]",
        required: false,
        description: "Array of database resources to add",
        attributes: [
          {
            name: "name",
            type: "string",
            required: true,
            description:
              "Database name (lowercase, numbers, underscores, hyphens only, max 24 chars)",
          },
          {
            name: "type",
            type: "string",
            required: true,
            description: "Database type",
            enum: ["postgresql", "mysql", "redis", "mongodb", "elasticsearch"],
          },
        ],
      },
      {
        name: "bucket",
        type: "object[]",
        required: false,
        description: "Array of object storage bucket resources to add",
        attributes: [
          {
            name: "name",
            type: "string",
            required: true,
            description:
              "Bucket name (lowercase, numbers, underscores, hyphens only, max 24 chars)",
          },
          {
            name: "policy",
            type: "string",
            required: true,
            description: "Bucket access policy",
            enum: ["private", "publicRead", "publicReadWrite"],
          },
        ],
      },
      {
        name: "app",
        type: "object[]",
        required: false,
        description: "Array of app resources to add",
        attributes: [
          {
            name: "name",
            type: "string",
            required: true,
            description:
              "App name (lowercase, numbers, underscores, hyphens only, max 24 chars)",
          },
          {
            name: "image",
            type: "string",
            required: true,
            description: "Docker image for the app (e.g., nginx:latest)",
          },
          {
            name: "ports",
            type: "object[]",
            required: false,
            description: "Array of ports to expose",
            attributes: [
              {
                name: "number",
                type: "number",
                required: true,
                description: "Port number (1-65535)",
              },
              {
                name: "publicAccess",
                type: "boolean",
                required: true,
                description: "Whether the port should be publicly accessible",
              },
            ],
          },
          {
            name: "env",
            type: "object[]",
            required: false,
            description: "Array of environment variables",
            attributes: [
              {
                name: "name",
                type: "string",
                required: true,
                description: "Environment variable name",
              },
              {
                name: "value",
                type: "string",
                required: true,
                description: "Environment variable value",
              },
            ],
          },
        ],
      },
    ],
    renderAndWaitForResponse: (props) => {
      return (
        <AddResourceToProjectActionMessage
          resources={props.args}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
};

export const getProjectResourcesAction = () => {
  const { stage } = useLanggraphState();
  const { selectedProject } = useProjectState();
  const { project } = useTRPCClients();
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "get_project_resources",
    available: stage === "manage_project" ? "enabled" : "disabled",
    description: "Get all resources from the currently selected project",
    handler: async () => {
      if (!selectedProject) {
        throw new Error("No project selected. Please select a project first.");
      }

      const result = await queryClient.fetchQuery(
        project.getResources.queryOptions(selectedProject)
      );

      return {
        projectName: selectedProject,
        targets: result?.targets || [],
        resources: result?.resources || [],
      };
    },
    render: ({ result, status }) => {
      if (status === "complete" && result) {
        return (
          <div className="w-full">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
                <p className="text-sm">
                  Successfully read project resources from "{result.projectName}
                  "
                </p>
              </div>
            </div>
          </div>
        );
      }
      return <div />;
    },
  });
};

export const checkAllLogsAction = () => {
  const { project } = useTRPCClients();
  const queryClient = useQueryClient();
  const { clusterResources, launchpadResources } = useFlowgraphResources();

  useCopilotAction({
    name: "check_all_logs",
    description:
      "Check all recent logs for the project to see if there are any errors or warnings.",
    available: "enabled",
    handler: async () => {
      const response = await queryClient.fetchQuery(
        project.allLogs.queryOptions({
          clusterResources,
          launchpadResources,
        })
      );
      return response.logs;
    },
    render: ({ result, status }) => {
      return <ProjectLogsActionMessage result={result} status={status} />;
    },
  });
};
