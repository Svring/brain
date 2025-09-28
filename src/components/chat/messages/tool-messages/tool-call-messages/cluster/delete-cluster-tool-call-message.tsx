import { CLUSTER_DEFAULT_ICON } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";

interface DeleteClusterToolCallMessageProps {
  cluster_name: string;
}

export function DeleteClusterToolCallMessage({ 
  cluster_name
}: DeleteClusterToolCallMessageProps) {
  const iconUrl = CLUSTER_DEFAULT_ICON;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt="Cluster Icon"
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Cluster
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {cluster_name.length > 15 ? `${cluster_name.slice(0, 15)}...` : cluster_name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
