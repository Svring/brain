"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Plus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect } from "react";
import ProjectCard from "@/components/project/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useProjects from "@/hooks/project/use-projects";
import { TextShimmer } from "@/components/project/components/text-shimmer";
import { useDisclosure } from "@reactuses/core";
import { CopilotSidebarWrapper } from "@/components/ai/copilot-sidebar-wrapper";
import CreateProject from "@/components/project/create-project/create-project";

export default function Page() {
  const { isOpen, onClose, onOpenChange } = useDisclosure();
  const {
    isOpen: isSearchOpen,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
  } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projects?.items) return [];

    return projects.items.filter((project) =>
      project.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects?.items, searchTerm]);

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
            <div className="relative w-full max-w-md">
              {isSearchOpen ? (
                <Input
                  ref={searchInputRef}
                  className="h-9 w-full"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => {
                    if (!searchTerm) {
                      onSearchClose();
                    }
                  }}
                  placeholder="Search projects..."
                  value={searchTerm}
                />
              ) : (
                <Button variant="ghost" onClick={onSearchOpen}>
                  <Search />
                </Button>
              )}
            </div>
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
      <CopilotSidebarWrapper />
    </div>
  );
}
