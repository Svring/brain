"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import ProjectCard from "@/components/app/project/project-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import useAI from "@/hooks/ai/use-ai";
import useProjects from "@/hooks/app/project/use-projects";
import { TextShimmer } from "@/components/app/project/text-shimmer";

const CreateProject = dynamic(
  () => import("@/components/app/project/create-project")
);
// const CopilotSidebar = dynamic(() =>
//   import("@copilotkit/react-ui").then((mod) => mod.CopilotSidebar)
// );

export default function Page() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();

  // useAI();

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
  };

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
          <Dialog
            onOpenChange={setIsCreateDialogOpen}
            open={isCreateDialogOpen}
          >
            <VisuallyHidden>
              <DialogTitle>Create Project</DialogTitle>
            </VisuallyHidden>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <Plus size={8} />
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[90vh] max-h-none w-[90vw] max-w-none">
              <CreateProject onClose={handleCloseDialog} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        <div className="grid grid-cols-3 gap-6">
          {projectsLoading && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <TextShimmer className="font-mono text-md" duration={1.2}>
                Loading projects...
              </TextShimmer>
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
                projectName={project.metadata.name}
              />
            ))
          )}
        </div>
      </div>
      {/* <CopilotSidebar
        instructions={
          "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        }
        labels={{
          title: "Popup Assistant",
          initial: "Need any help?",
        }}
      /> */}
    </div>
  );
}
