interface DeleteLaunchpadEnvToolCallMessageProps {
  launchpad_name: string;
  env_names: string[];
}

export function DeleteLaunchpadEnvToolCallMessage({ launchpad_name, env_names }: DeleteLaunchpadEnvToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Launchpad:</span>
          <span className="text-sm text-foreground font-mono">{launchpad_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Env Names:</span>
          <span className="text-sm text-foreground font-mono">[{env_names.join(", ")}]</span>
        </div>
      </div>
    </div>
  );
}
