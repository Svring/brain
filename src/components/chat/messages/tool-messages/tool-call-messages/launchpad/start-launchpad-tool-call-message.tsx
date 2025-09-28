interface StartLaunchpadToolCallMessageProps {
  launchpad_name: string;
  image?: string;
}

export function StartLaunchpadToolCallMessage({
  launchpad_name,
  image,
}: StartLaunchpadToolCallMessageProps) {
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
                {launchpad_name.length > 28
                  ? `${launchpad_name.slice(0, 28)}...`
                  : launchpad_name}
              </span>
            </div>
          </div>
        </div>
        {image && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Image:{" "}
              <span className="font-mono text-foreground">
                {image.length > 28 ? `${image.slice(0, 28)}...` : image}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
