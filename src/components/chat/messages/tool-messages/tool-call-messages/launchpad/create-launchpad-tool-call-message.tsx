interface CreateLaunchpadToolCallMessageProps {
  name: string;
  image: string;
  cpu?: number;
  memory?: number;
  replicas?: number;
  ports?: number[];
  env?: Array<[string, string]>;
}

export function CreateLaunchpadToolCallMessage({ 
  name, 
  image, 
  cpu, 
  memory, 
  replicas, 
  ports, 
  env 
}: CreateLaunchpadToolCallMessageProps) {
  const iconUrl = "https://applaunchpad.bja.sealos.run/logo.svg";

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt="Launchpad Icon"
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Launchpad
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {name.length > 28 ? `${name.slice(0, 28)}...` : name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Image:{" "}
            <span className="font-mono text-foreground">
              {image.length > 28 ? `${image.slice(0, 28)}...` : image}
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
        {(replicas !== undefined || (ports && ports.length > 0)) && (
          <div className="flex items-center gap-4">
            {replicas !== undefined && (
              <span className="text-sm text-muted-foreground">
                Replicas:{" "}
                <span className="font-mono text-foreground">
                  {replicas}
                </span>
              </span>
            )}
            {ports && ports.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ports:</span>
                <div className="flex items-center gap-1">
                  {ports.map((port, index) => (
                    <span key={index} className="font-mono text-sm text-foreground">
                      {port}
                      {index < ports.length - 1 && ","}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {env && env.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Environment:{" "}
              <span className="font-mono text-foreground">
                {env.length} variables
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
