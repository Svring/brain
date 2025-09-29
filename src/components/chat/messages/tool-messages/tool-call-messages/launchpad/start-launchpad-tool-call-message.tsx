interface StartLaunchpadToolCallMessageProps {
  launchpad_name: string;
}

export function StartLaunchpadToolCallMessage({
  launchpad_name,
}: StartLaunchpadToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none">
            Launchpad
          </span>
          <span className="text-lg font-bold text-foreground leading-tight">
            {launchpad_name.length > 28
              ? `${launchpad_name.slice(0, 28)}...`
              : launchpad_name}
          </span>
        </div>
      </div>
    </div>
  );
}
