"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import ProjectCard from "@/components/project/components/project-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useProjects from "@/hooks/project/use-projects";
import { TextShimmer } from "@/components/project/components/text-shimmer";
import { useDisclosure } from "@reactuses/core";
import CreateProject from "@/components/project/create-project/create-project";
import AiCoin from "@/components/ai/headless/ai-coin";
import AiChatbox from "@/components/ai/headless/ai-chatbox";
import SearchBar from "@/components/app/search-bar";
import { getInstanceRelatedResources } from "@/lib/algorithm/relevance/instance-relevance";
import { useMount } from "@reactuses/core";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { getPodsByResourceTarget } from "@/lib/k8s/k8s-method/k8s-query";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

export default function Page() {
  const { isOpen, onClose, onOpenChange } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projects?.items) return [];

    return projects.items.filter((project) =>
      project.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects?.items, searchTerm]);

  // const context = createK8sContext();
  // useMount(async () => {
  //   // const relatedResources = await getInstanceRelatedResources(
  //   //   context,
  //   //   "teable-afdmhcrb"
  //   // );
  //   // console.log(relatedResources);

  //   // Test getPodsByResourceTarget with cluster
  //   const clusterConfig = CUSTOM_RESOURCES.cluster;
  //   const clusterTarget = {
  //     type: "custom" as const,
  //     group: clusterConfig.group,
  //     version: clusterConfig.version,
  //     plural: clusterConfig.plural,
  //     name: "ai-postgresql-postgresql",
  //   };

  //   try {
  //     const pods = await getPodsByResourceTarget(context, clusterTarget);
  //     console.log("Pods owned by ai-postgresql:", pods);
  //   } catch (error) {
  //     console.error("Error fetching pods for cluster:", error);
  //   }
  // });

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
            <Dialog onOpenChange={onOpenChange} open={isOpen}>
              <VisuallyHidden>
                <DialogTitle>Create Project</DialogTitle>
              </VisuallyHidden>
              <DialogTrigger asChild>
                <Button variant="ghost">
                  <Plus />
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[90vh] max-h-none w-[90vw] max-w-none">
                <CreateProject onClose={onClose} />
              </DialogContent>
            </Dialog>
          </div>
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

          {!projectsError && (
            <>
              {filteredProjects.length !== 0 &&
                filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.metadata.name}
                    projectName={project.metadata.name}
                  />
                ))}
            </>
          )}
        </div>
      </div>

      <AiCoin />
      <AiChatbox />
    </div>
  );
}
