interface EnvVar {
  name: string;
  value: string;
}

interface CreateLaunchpadEnvToolCallMessageProps {
  launchpad_name: string;
  env_vars: EnvVar[];
}

export function CreateLaunchpadEnvToolCallMessage({ launchpad_name, env_vars }: CreateLaunchpadEnvToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Launchpad:</span>
          <span className="text-sm text-foreground font-mono">{launchpad_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Env Vars:</span>
          <span className="text-sm text-foreground font-mono">{JSON.stringify(env_vars, null, 2)}</span>
        </div>
      </div>
    </div>
  );
}
