"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/project/project-card";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { useProjectActions } from "@/contexts/project/project-context";
import { Spinner } from "@/components/ui/spinner";
import EmptyState from "@/components/project/empty-state";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { z } from "zod";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ProjectProposalPresentation } from "@/components/chat/state-cards/project-proposal/project-proposal-presentation";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

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

  // Dummy project proposal data for preview demonstration
  const dummyProposal: ProjectProposal = {
    name: "Full-Stack Web Application",
    resources: {
      devbox: [
        {
          name: "frontend-dev",
          runtime: "next.js",
          ports: [
            { number: 3000, publicAccess: true },
            { number: 8080, publicAccess: false },
          ],
        },
        {
          name: "backend-dev",
          runtime: "python",
          ports: [{ number: 8000, publicAccess: true }],
        },
      ],
      database: [
        {
          name: "postgres-db",
          type: "postgresql",
        },
      ],
      bucket: [
        {
          name: "user-uploads",
          policy: "private",
        },
      ],
      app: [
        {
          name: "api-server",
          image: "nginx:latest",
          ports: [
            { number: 80, publicAccess: true },
            { number: 443, publicAccess: true },
          ],
          env: [
            { name: "NODE_ENV", value: "production" },
            { name: "DATABASE_URL", value: "postgresql://..." },
          ],
          reliances: {
            database: ["postgres-db"],
            bucket: ["user-uploads"],
          },
        },
      ],
    },
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Update the global project context with all projects when they're loaded
  useEffect(() => {
    if (!isLoading && !isError && projects) {
      setAllProjects(projects);
    }
  }, [projects]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-8">
      {/* Header */}
      <div className="mb-8 flex w-4xl">
        <div className="flex w-full items-center gap-4">
          <h1 className="rounded-md px-3 py-1 font-semibold text-lg">
            Projects
          </h1>
          {/* Search bar */}
          <div className="relative">
            <Input
              className="h-8 w-36 pl-8"
              placeholder="Search..."
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <SearchIcon
              aria-hidden="true"
              className="absolute start-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <kbd className="bg-muted pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        <div className="grid grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex h-32 items-center justify-center">
              <Spinner variant="bars" size={24} />
            </div>
          ) : isError ? (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-destructive">Error loading projects</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full">
              {projects && projects.length > 0 && searchTerm ? (
                // Show search empty state when there are projects but no matches
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No projects found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No projects match "{searchTerm}". Try a different search
                      term.
                    </p>
                  </div>
                </div>
              ) : (
                // Show general empty state when there are no projects at all
                <EmptyState />
              )}
            </div>
          ) : (
            filteredProjects.map(
              (project: z.infer<typeof ProjectObjectSchema>) => (
                <ProjectCard key={project.name} project={project} />
              )
            )
          )}
        </div>
      </div>

      {/* Project Proposal Demo */}
      <div className="mb-8 w-4xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">
            Project Proposal Demo
          </h2>
          <p className="text-sm text-muted-foreground">
            Interactive project proposal with list/graph view toggle and create functionality
          </p>
        </div>
        <ProjectProposalPresentation proposal={dummyProposal} />
      </div>
      {/* <ProjectProposalDemo /> */}
      {/* <CreateProjectDialog /> */}
    </div>
  );
}
