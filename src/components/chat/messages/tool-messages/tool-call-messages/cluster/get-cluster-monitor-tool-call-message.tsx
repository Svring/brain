interface GetClusterMonitorToolCallMessageProps {
  cluster_name: string;
  db_type: string;
}

export function GetClusterMonitorToolCallMessage({ cluster_name, db_type }: GetClusterMonitorToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Cluster:</span>
          <span className="text-sm text-foreground font-mono">{cluster_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">DB Type:</span>
          <span className="text-sm text-foreground font-mono">{db_type}</span>
        </div>
      </div>
    </div>
  );
}
