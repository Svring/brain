interface StartClusterToolCallMessageProps {
  cluster_name: string;
}

export function StartClusterToolCallMessage({
  cluster_name,
}: StartClusterToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none">
            Cluster
          </span>
          <span className="text-lg font-bold text-foreground leading-tight">
            {cluster_name.length > 15
              ? `${cluster_name.slice(0, 15)}...`
              : cluster_name}
          </span>
        </div>
      </div>
    </div>
  );
}
