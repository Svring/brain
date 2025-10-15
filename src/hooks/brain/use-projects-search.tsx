"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export default function useProjectSearch() {
	const context = createK8sContext();
	const [searchTerm, setSearchTerm] = useState("");

	const { project } = useTRPCClients();

	const {
		data: projects,
		isLoading,
		isError,
	} = useQuery(project.list.queryOptions("projects"));

	console.log("projects", projects);

	// Memoize lowercase search term to avoid repeated calls
	const lowerSearchTerm = useMemo(() => searchTerm.toLowerCase(), [searchTerm]);

	// Filter projects based on search term
	const filteredProjects = useMemo(() => {
		if (!projects?.length) return [];

		return projects.filter((project) =>
			project.displayName.toLowerCase().includes(lowerSearchTerm),
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
