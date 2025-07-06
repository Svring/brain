import { motion } from "motion/react";
import Link from "next/link";
import type React from "react";
import { useProjectResources } from "@/hooks/app/project/use-project-resources";
import { convertAllResourcesToTargets } from "@/lib/k8s/k8s-utils";
import type { ResourceTarget } from "@/lib/k8s/schemas";

interface ProjectCardProps {
  projectName: string;
  resources: ResourceTarget[];
}

interface ProjectCardWrapperProps {
  projectName: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  resources,
}) => {
  return (
    <Link
      className="block h-full w-full"
      href={`/project/${encodeURIComponent(projectName)}`}
    >
      <motion.div
        className="flex min-h-[160px] w-full cursor-pointer flex-col rounded-lg border bg-background p-4 text-left shadow-sm"
        transition={{ duration: 0.15, ease: "easeInOut" }}
        whileHover={{ y: -5 }}
      >
        <h3 className="mb-2 text-foreground">{projectName}</h3>
        <p className="text-md text-muted-foreground">
          {resources.length} resources
        </p>
      </motion.div>
    </Link>
  );
};

export const ProjectCardWrapper: React.FC<ProjectCardWrapperProps> = ({
  projectName,
}) => {
  const {
    data: resourcesData,
    isLoading,
    isError,
  } = useProjectResources(projectName);

  // Transform the filtered resources to ResourceTarget format
  const resources = resourcesData
    ? convertAllResourcesToTargets(resourcesData)
    : [];

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-background p-4 shadow-sm">
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">
          {projectName}
        </h3>
        <p className="text-red-600 text-sm">Error loading resources</p>
      </div>
    );
  }

  return <ProjectCard projectName={projectName} resources={resources} />;
};

// Export the wrapper as the default export
export { ProjectCardWrapper as ProjectCard };
