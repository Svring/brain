import { useCopilotAction } from "@copilotkit/react-core";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/devbox/devbox-constant/devbox-constant-runtimes";
import { useTemplates } from "@/hooks/template/use-templates";
import { createTemplateApiContext } from "@/lib/auth/auth-utils";
import { useMemo } from "react";

export const activateAppActions = () => {
  deployTemplateAppAction();
  deployImageAppAction();
  importGithubRepoAppAction();
  createNewAppAction();
};

const deployTemplateAppAction = () => {
  const templateApiContext = createTemplateApiContext();
  const { templates } = useTemplates(templateApiContext);
  const templateNames = useMemo(() => {
    return templates.map((template) => template.metadata.name);
  }, [templates]);

  useCopilotAction({
    name: "deployTemplateApp",
    description: "Deploy a pre-configured template application from the available template library. Templates include ready-to-use configurations for common development scenarios like web apps, APIs, databases, and microservices. You should automatically generate an appropriate project name based on the template being deployed.",
    parameters: [
      {
        name: "projectName",
        type: "string",
        required: true,
        description: "Name of the project",
      },
      {
        name: "templateName",
        type: "string",
        enum: templateNames,
        required: true,
        description: "Name of the template to deploy (e.g., 'nextjs-starter', 'express-api', 'postgres-db')",
      },
    ],
  });
};

const deployImageAppAction = () => {
  useCopilotAction({
    name: "deployImageApp",
    description: "Deploy an application from a Docker container image. This allows you to run any containerized application by specifying the image name from Docker Hub or other container registries. You should automatically generate an appropriate project name based on the image being deployed.",
    parameters: [
      {
        name: "projectName",
        type: "string",
        required: true,
        description: "Name of the project",
      },
      {
        name: "imageName",
        type: "string",
        required: true,
        description: "Docker image name with optional tag (e.g., 'nginx:latest', 'postgres:14', 'redis:alpine')",
      },
    ],
    handler: async (props) => {
      console.log(props);
    },
  });
};

const importGithubRepoAppAction = () => {
  useCopilotAction({
    name: "importGithubRepo",
    description: "Import and deploy an application directly from a GitHub repository. The system will automatically detect the project type, install dependencies, and configure the deployment environment. You should automatically generate an appropriate project name based on the repository being imported.",
    parameters: [
      {
        name: "projectName",
        type: "string",
        required: true,
        description: "Name of the project",
      },
      {
        name: "repoUrl",
        type: "string",
        required: true,
        description: "Full GitHub repository URL (e.g., 'https://github.com/username/repository-name')",
      },
    ],
  });
};

const createNewAppAction = () => {
  useCopilotAction({
    name: "createNewApp",
    description:
      "Create a new app in a new project for development with specific runtimes (nextjs for full stack development, nodejs for backend, c++ for system programming, etc.) tailored to different use cases. You should automatically generate an appropriate project name based on the apps being created.",
    parameters: [
      {
        name: "projectName",
        type: "string",
        required: true,
        description: "Name of the project",
      },
      {
        name: "apps",
        type: "object[]",
        required: true,
        description: "Array of application configurations to create within the project",
        attributes: [
          {
            name: "appName",
            type: "string",
            required: true,
            description: "Unique name for the application (e.g., 'frontend', 'api-server', 'worker-service')",
          },
          {
            name: "appRuntime",
            type: "string",
            enum: DEVBOX_RUNTIMES,
            required: true,
            description: "Development runtime environment that determines the programming language, framework, and toolchain for the application",
          },
        ],
      },
    ],
    handler: async (props) => {
      console.log(props);
    },
  });
};
