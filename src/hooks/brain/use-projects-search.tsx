"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/brain/resources/project/project-method/project-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export default function useProjectSearch(context: K8sApiContext) {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery(listProjectsOptions(context));

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projects?.length) return [];

    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredProjects,
    isLoading,
    isError,
  };
}
