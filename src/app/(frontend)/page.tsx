"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DevboxTable } from "@/components/app/inventory/devbox/devbox-table";
import { ProjectCard } from "@/components/app/project/project-card";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/app/project";
import { cn } from "@/lib/utils";

type ActiveTab = "project" | "inventory";

export default function Page() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("project");

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-8">
      {/* Header */}
      <div className="mb-8 flex w-4xl">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "rounded-md px-3 py-1 font-semibold text-lg transition-colors",
                activeTab === "project"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab("project")}
              type="button"
            >
              Project
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              className={cn(
                "rounded-md px-3 py-1 font-semibold text-lg transition-colors",
                activeTab === "inventory"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab("inventory")}
              type="button"
            >
              Inventory
            </button>
          </div>
          <Button
            aria-label="Add New"
            className="inline-flex items-center justify-center text-foreground transition-colors focus:outline-none"
            variant="ghost"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        {activeTab === "project" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {projectsLoading && (
              <div className="col-span-full flex h-32 items-center justify-center">
                <div className="text-muted-foreground">Loading projects...</div>
              </div>
            )}

            {projectsError && (
              <div className="col-span-full flex h-32 items-center justify-center">
                <div className="text-destructive">Error loading projects</div>
              </div>
            )}

            {projects &&
            !projectsLoading &&
            !projectsError &&
            projects.items.length === 0 ? (
              <div className="col-span-full flex h-32 items-center justify-center">
                <div className="text-muted-foreground">No projects found</div>
              </div>
            ) : (
              projects?.items.map((project) => (
                <ProjectCard
                  key={project.metadata.name}
                  onClick={() => {
                    // TODO: Navigate to project detail page
                  }}
                  projectName={project.spec.title || project.metadata.name}
                  resourceCount={1} // Each instance represents one project
                />
              ))
            )}
          </div>
        )}

        {activeTab === "inventory" && <DevboxTable />}
      </div>
    </div>
  );
}
