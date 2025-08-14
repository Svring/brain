"use client";

import { Plus } from "lucide-react";
import { useEffect } from "react";
import ProjectCard from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/search-bar";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { useProjectCreateDialog } from "@/hooks/brain/use-project-create-dialog";
import { useProjectActions } from "@/contexts/project/project-context";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  const context = createK8sContext();

  const { openDialog, CreateProjectDialog } = useProjectCreateDialog();
  const { setAllProjects } = useProjectActions();

  const { setSearchTerm, filteredProjects, projects, isLoading, isError } =
    useProjectSearch(context);

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
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <h1 className="rounded-md px-3 py-1 font-semibold text-lg">
              Projects
            </h1>
          </div>
          {/* Search bar and plus button in the same row */}
          <div className="flex items-center gap-3">
            <SearchBar
              onSearchChange={setSearchTerm}
              placeholder="Search projects..."
            />
            <Button variant="ghost" onClick={openDialog}>
              <Plus />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        <div className="grid grid-cols-3 gap-6">
          {isLoading && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <Spinner variant="bars" size={24} />
            </div>
          )}

          {isError && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-destructive">Error loading projects</div>
            </div>
          )}

          {!isError && (
            <>
              {filteredProjects.length !== 0 &&
                filteredProjects.map((project: any) => (
                  <ProjectCard key={project.name} project={project} />
                ))}
            </>
          )}
        </div>
      </div>

      {/* <div className="pt-8 pb-4 flex-1 min-h-0">
        <div className="w-3xl mx-auto px-4 h-full">
          <div className="h-96">
            <ProjectPlanCard
              analyzingStatus="active"
              proposingStatus="completed"
              analyzingData={["Requirement 1", "Requirement 2"]}
              proposingData={{
                name: "My Project",
                description: "A sample project",
                resources: {
                  devboxes: [
                    { runtime: "React", description: "Frontend framework" },
                  ],
                  databases: [
                    { type: "postgresql", description: "Primary database" },
                  ],
                  buckets: [{ policy: "Private", description: "Secure storage" }],
                },
              }}
            />
          </div>
        </div>
      </div> */}

      {/* <AiCoin />
      <AiChatbox /> */}
      <CreateProjectDialog />
    </div>
  );
}
