"use client";

import { useState, useMemo } from "react";
import useProjects from "@/hooks/project/use-projects";

export default function useProjectSearch() {
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

  return {
    searchTerm,
    setSearchTerm,
    filteredProjects,
    projectsLoading,
    projectsError,
  };
}