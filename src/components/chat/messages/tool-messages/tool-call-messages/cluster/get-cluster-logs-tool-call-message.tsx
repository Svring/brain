interface GetClusterLogsToolCallMessageProps {
  cluster_name: string;
}

export function GetClusterLogsToolCallMessage({ cluster_name }: GetClusterLogsToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Cluster:</span>
          <span className="text-sm text-foreground font-mono">{cluster_name}</span>
        </div>
      </div>
    </div>
  );
}
