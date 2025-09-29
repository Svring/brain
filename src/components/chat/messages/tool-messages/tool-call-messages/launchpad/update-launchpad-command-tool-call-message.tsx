interface LaunchCommand {
  command: string;
  args: string;
}

interface UpdateLaunchpadCommandToolCallMessageProps {
  launchpad_name: string;
  launch_command: LaunchCommand;
}

export function UpdateLaunchpadCommandToolCallMessage({
  launchpad_name,
  launch_command,
}: UpdateLaunchpadCommandToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Launchpad:
          </span>
          <span className="text-sm text-foreground font-mono">
            {launchpad_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Command:
          </span>
          <span className="text-sm text-foreground font-mono">
            {launch_command.command || "empty"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Args:
          </span>
          <span className="text-sm text-foreground font-mono">
            {launch_command.args || "empty"}
          </span>
        </div>
      </div>
    </div>
  );
}
