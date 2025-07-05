import type React from "react";
import type { ResourceTarget } from "@/lib/k8s/schemas";

interface ProjectCardProps {
  projectName: string;
  resources: ResourceTarget[];
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  resources,
}) => {
  return <div>123</div>;
};
