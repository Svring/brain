import {
  LAUNCHPAD_TYPE_ICONS,
  LAUNCHPAD_DEFAULT_ICON,
} from "@/lib/sealos/resources/launchpad/launchpad-constant/launchpad-constant-icons";

interface RestartLaunchpadToolCallMessageProps {
  launchpad_name: string;
  type?: string;
}

export function RestartLaunchpadToolCallMessage({ 
  launchpad_name, 
  type = "default" 
}: RestartLaunchpadToolCallMessageProps) {
  const iconUrl =
    LAUNCHPAD_TYPE_ICONS[type as keyof typeof LAUNCHPAD_TYPE_ICONS] ||
    LAUNCHPAD_DEFAULT_ICON;

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
                {launchpad_name.length > 15 ? `${launchpad_name.slice(0, 15)}...` : launchpad_name}
              </span>
            </div>
          </div>
        </div>
        {type && type !== "default" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Type:{" "}
              <span className="font-mono text-foreground">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
