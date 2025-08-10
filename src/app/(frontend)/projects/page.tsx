"use client";

import { Plus } from "lucide-react";
import BrainProjectCard from "@/components/brain/brain-project-card";
import { Button } from "@/components/ui/button";
import { TextShimmer } from "@/components/project/components/text-shimmer";
import { useCreateProjectDialog } from "@/hooks/project/use-project-create-dialog";
import AiCoin from "@/components/ai/headless/ai-coin";
import AiChatbox from "@/components/ai/headless/ai-chatbox";
import SearchBar from "@/components/app/search-bar";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useBrainProjectSearch from "@/hooks/brain/use-brain-project-search";

export default function Page() {
  const context = createK8sContext();

  const { openDialog, CreateProjectDialog } = useCreateProjectDialog();

  const { setSearchTerm, filteredBrainProjects, isLoading, isError } =
    useBrainProjectSearch(context);

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
              <TextShimmer className="font-mono text-md" duration={1.2}>
                Loading projects...
              </TextShimmer>
            </div>
          )}

          {isError && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-destructive">Error loading projects</div>
            </div>
          )}

          {!isError && (
            <>
              {filteredBrainProjects.length !== 0 &&
                filteredBrainProjects.map((project) => (
                  <BrainProjectCard key={project.name} project={project} />
                ))}
            </>
          )}
        </div>
      </div>

      <AiCoin />
      <AiChatbox />
      <CreateProjectDialog />
    </div>
  );
}
