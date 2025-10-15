"use client";

import { Plus, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { CreateNewProject } from "@/components/project/create-new-project";
import EmptyState from "@/components/project/empty-state";
import ProjectCard from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useProjectActions } from "@/contexts/project/project-context";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import type { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";

export default function Page() {
	const { setAllProjects } = useProjectActions();
	const {
		setSearchTerm,
		filteredProjects,
		projects,
		isLoading,
		isError,
		searchTerm,
	} = useProjectSearch();

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	useEffect(() => {
		if (!isLoading && !isError && projects) {
			setAllProjects(projects);
		}
	}, [projects, isLoading, isError]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleCreateProject = (projectName: string) => {};

	return (
		<div className="flex min-h-screen w-full flex-col items-center p-8">
			<div className="mb-6 w-full max-w-4xl flex items-center justify-between">
				<h1 className="text-lg font-semibold">Projects</h1>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Input
							className="h-8 w-36 pl-8"
							placeholder="Search..."
							onChange={handleSearchChange}
						/>
						<SearchIcon
							className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
							size={16}
						/>
					</div>
					<Button
						size="sm"
						variant="outline"
						onClick={() => setIsCreateDialogOpen(true)}
						className="h-8 w-8 p-0"
					>
						<Plus size={16} />
					</Button>
				</div>
			</div>

			<div className="w-full max-w-4xl">
				{isLoading ? (
					<div className="flex h-32 items-center justify-center">
						<Spinner variant="bars" size={24} />
					</div>
				) : isError ? (
					<div className="flex h-32 items-center justify-center text-destructive">
						Error loading projects
					</div>
				) : filteredProjects.length === 0 ? (
					searchTerm && projects?.length && projects.length > 0 ? (
						<div className="flex flex-col items-center py-12 text-center">
							<h3 className="text-lg font-medium text-muted-foreground mb-2">
								No projects found
							</h3>
							<p className="text-sm text-muted-foreground">
								No projects match "{searchTerm}". Try a different search term.
							</p>
						</div>
					) : (
						<EmptyState />
					)
				) : (
					<div className="grid grid-cols-3 gap-6">
						{filteredProjects.map(
							(project: z.infer<typeof ProjectObjectSchema>) => (
								<ProjectCard key={project.name} project={project} />
							),
						)}
					</div>
				)}
			</div>

			<CreateNewProject
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onConfirm={handleCreateProject}
			/>
		</div>
	);
}
