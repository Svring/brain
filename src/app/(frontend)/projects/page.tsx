"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { SearchIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ProjectCard from "@/components/project/project-card";
import EmptyState from "@/components/project/empty-state";
import { CreateNewProject } from "@/components/project/create-new-project";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { useProjectActions } from "@/contexts/project/project-context";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { SearchAppStoreActionMessage } from "@/components/copilot/langgraph/search-app-store-action-message";
import { ProposeTemplateDeploymentMessage } from "@/components/copilot/langgraph/propose-template-deployment-message";
import { ProposeDevenvDeploymentMessage } from "@/components/copilot/langgraph/propose-devenv-deployment-message";
import { ProposeImageDeploymentMessage } from "@/components/copilot/langgraph/propose-image-deployment-message";

// Example App Store data for demonstration
const exampleAppStoreResults = {
  query_keywords: ["nginx", "redis"],
  total_templates: 150,
  relevant_templates: [
    {
      name: "nginx",
      gitRepo: "https://github.com/nginx/nginx",
      description: "High performance web server and reverse proxy server",
      inputs: {
        port: {
          description: "Port number for the web server",
          type: "number",
          default: "80",
          required: false,
        },
        workers: {
          description: "Number of worker processes",
          type: "number",
          default: "auto",
          required: false,
        },
        password: {
          description: "Admin password for nginx",
          type: "string",
          default: "",
          required: false,
        },
      },
      similarity_score: 0.95,
    },
    {
      name: "redis",
      gitRepo: "https://github.com/redis/redis",
      description:
        "In-memory data structure store used as database, cache, and message broker",
      inputs: {
        port: {
          description: "Port number for Redis server",
          type: "number",
          default: "6379",
          required: false,
        },
        password: {
          description: "Password for Redis authentication",
          type: "string",
          default: "",
          required: true,
        },
        workers: {
          description: "Number of worker processes",
          type: "number",
          default: "1",
          required: false,
        },
      },
      similarity_score: 0.88,
    },
  ],
};

// Example deployment data for demonstration
const exampleTemplateDeployment = {
  template_name: "perplexica",
};

const exampleDevenvDeployment = {
  devbox: {
    name: "my-devbox",
    runtime: "next.js",
    ports: [3000, 8080],
  },
  database: {
    name: "postgres-db",
    type: "postgresql",
  },
};

const exampleImageDeployment = {
  image_name: "nginx:latest",
  ports: [80, 443],
  database: {
    name: "redis-cache",
    type: "redis",
  },
};

export default function Page() {
  const { setAllProjects } = useProjectActions();
  const {
    setSearchTerm,
    filteredProjects,
    projects,
    isLoading,
    isError,
    searchTerm,
  } = useProjectSearch();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isError && projects) {
      setAllProjects(projects);
    }
  }, [projects, isLoading, isError]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateProject = (projectName: string) => {
    console.log("Creating project:", projectName);
    // TODO: Implement actual project creation logic
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-8">
      <div className="mb-6 w-full max-w-4xl flex items-center justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              className="h-8 w-36 pl-8"
              placeholder="Search..."
              onChange={handleSearchChange}
            />
            <SearchIcon
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner variant="bars" size={24} />
          </div>
        ) : isError ? (
          <div className="flex h-32 items-center justify-center text-destructive">
            Error loading projects
          </div>
        ) : filteredProjects.length === 0 ? (
          searchTerm && projects?.length && projects.length > 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No projects found
              </h3>
              <p className="text-sm text-muted-foreground">
                No projects match "{searchTerm}". Try a different search term.
              </p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredProjects.map(
              (project: z.infer<typeof ProjectObjectSchema>) => (
                <ProjectCard key={project.name} project={project} />
              )
            )}
          </div>
        )}
      </div>

      {/* <div className="w-full max-w-4xl mt-12">
        <SearchAppStoreActionMessage result={exampleAppStoreResults} />
      </div>

      <div className="w-full max-w-4xl mt-12">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Example Deployment Components
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <ProposeTemplateDeploymentMessage
              args={exampleTemplateDeployment}
              onSuccess={(data) => console.log("Template deployed:", data)}
            />
          </div>

          <div>
            <ProposeDevenvDeploymentMessage
              args={exampleDevenvDeployment}
              onSuccess={(data) => console.log("DevEnv deployed:", data)}
            />
          </div>

          <div>
            <ProposeImageDeploymentMessage
              args={exampleImageDeployment}
              onSuccess={(data) => console.log("Image deployed:", data)}
            />
          </div>
        </div>
      </div> */}

      <CreateNewProject
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onConfirm={handleCreateProject}
      />
    </div>
  );
}
