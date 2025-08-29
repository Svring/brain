import { Skeleton } from "@/components/ui/skeleton";

const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="relative flex min-h-[160px] w-full flex-col rounded-lg border bg-background-secondary p-4 shadow-sm">
      {/* Skeleton for dropdown menu button */}
      <div className="absolute top-2 right-2">
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Skeleton for project title */}
      <Skeleton className="mb-2 h-6 w-3/4 rounded" />

      {/* Skeleton for avatar circles in bottom right */}
      <div className="absolute bottom-4 right-4">
        <div className="flex items-center space-x-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Skeleton card in center */}
      <div className="w-full max-w-sm">
        <ProjectCardSkeleton />
      </div>

      {/* Text content */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          No projects created yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Click here to create a project.
        </p>
      </div>
    </div>
  );
};

export { ProjectCardSkeleton };
export default EmptyState;
