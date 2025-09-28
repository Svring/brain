import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface CreateClusterToolCallMessageProps {
  name: string;
  type: string;
  cpu?: number;
  memory?: number;
  storage?: number;
  replicas?: number;
}

export function CreateClusterToolCallMessage({
  name,
  type,
  cpu,
  memory,
  storage,
  replicas,
}: CreateClusterToolCallMessageProps) {
  const iconUrl = getClusterIconUrl(type);

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt={`${type} Icon`}
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
                {name.length > 15 ? `${name.slice(0, 15)}...` : name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Type:{" "}
            <span className="font-mono text-foreground">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </span>
          {cpu !== undefined && (
            <span className="text-sm text-muted-foreground">
              CPU:{" "}
              <span className="font-mono text-foreground">
                {cpu}Core
              </span>
            </span>
          )}
          {memory !== undefined && (
            <span className="text-sm text-muted-foreground">
              Memory:{" "}
              <span className="font-mono text-foreground">
                {memory}GB
              </span>
            </span>
          )}
        </div>
        {(storage !== undefined || replicas !== undefined) && (
          <div className="flex items-center gap-4">
            {storage !== undefined && (
              <span className="text-sm text-muted-foreground">
                Storage:{" "}
                <span className="font-mono text-foreground">
                  {storage}GB
                </span>
              </span>
            )}
            {replicas !== undefined && (
              <span className="text-sm text-muted-foreground">
                Replicas:{" "}
                <span className="font-mono text-foreground">
                  {replicas}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
