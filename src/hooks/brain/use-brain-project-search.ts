"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBrainProjectsQuery } from "@/lib/brain/brain-methods/brain-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export default function useBrainProjectSearch(context: K8sApiContext) {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: brainProjects,
    isLoading,
    isError,
  } = useQuery(listBrainProjectsQuery(context));

  // Filter projects based on search term
  const filteredBrainProjects = useMemo(() => {
    if (!brainProjects?.length) return [];

    return brainProjects.filter((project) =>
      project.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brainProjects, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredBrainProjects,
    isLoading,
    isError,
  };
}
