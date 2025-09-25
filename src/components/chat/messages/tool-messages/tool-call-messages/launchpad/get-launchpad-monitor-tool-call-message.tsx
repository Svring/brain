interface GetLaunchpadMonitorToolCallMessageProps {
  launchpad_name: string;
  step?: string;
}

export function GetLaunchpadMonitorToolCallMessage({ launchpad_name, step = "2m" }: GetLaunchpadMonitorToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Launchpad:</span>
          <span className="text-sm text-foreground font-mono">{launchpad_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Step:</span>
          <span className="text-sm text-foreground font-mono">{step}</span>
        </div>
      </div>
    </div>
  );
}
