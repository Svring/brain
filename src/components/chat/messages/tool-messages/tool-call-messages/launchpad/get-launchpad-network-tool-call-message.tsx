interface GetLaunchpadNetworkToolCallMessageProps {
  launchpad_name: string;
}

export function GetLaunchpadNetworkToolCallMessage({ launchpad_name }: GetLaunchpadNetworkToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Launchpad:</span>
          <span className="text-sm text-foreground font-mono">{launchpad_name}</span>
        </div>
      </div>
    </div>
  );
}
