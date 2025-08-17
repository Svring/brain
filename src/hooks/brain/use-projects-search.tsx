"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { projectClient } from "@/components/provider/trpc-provider";

export default function useProjectSearch(context: K8sApiContext) {
  const [searchTerm, setSearchTerm] = useState("");

  const projectTrpcClient = projectClient.useTRPC();

  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery(projectTrpcClient.listProjects.queryOptions());

  // Memoize lowercase search term to avoid repeated calls
  const lowerSearchTerm = useMemo(() => searchTerm.toLowerCase(), [searchTerm]);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projects?.length) return [];

    return projects.filter((project) =>
      project.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [projects, lowerSearchTerm]);

  return {
    projects,
    searchTerm,
    setSearchTerm,
    filteredProjects,
    isLoading,
    isError,
  };
}
