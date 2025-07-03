import type React from "react";
import { SpotlightCard } from "@/components/app/base/spotlight-card";

interface ProjectCardProps {
  projectName: string;
  resourceCount?: number;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  resourceCount = 0,
  onClick,
}) => {
  return (
    <button
      className="cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-105"
      onClick={onClick}
      type="button"
    >
      <SpotlightCard>
        <div className="flex flex-col gap-2">
          <h3
            className="truncate font-semibold text-heading-text text-lg"
            title={projectName}
          >
            {projectName}
          </h3>
          <p className="text-paragraph-text text-sm">
            {resourceCount} {resourceCount === 1 ? "resource" : "resources"}
          </p>
        </div>
      </SpotlightCard>
    </button>
  );
};
