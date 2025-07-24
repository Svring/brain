"use client";

import { useState, useMemo } from "react";
import useProjects from "@/hooks/project/use-projects";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";

export default function useProjectSearch(context: K8sApiContext) {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects(context);

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
