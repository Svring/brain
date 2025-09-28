import {
  DEVBOX_RUNTIME_ICONS,
  DEVBOX_DEFAULT_ICON,
} from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";

interface AutostartDevboxToolCallMessageProps {
  devbox_name: string;
  runtime?: string;
}

export function AutostartDevboxToolCallMessage({
  devbox_name,
  runtime = "default",
}: AutostartDevboxToolCallMessageProps) {
  const iconUrl =
    DEVBOX_RUNTIME_ICONS[runtime as keyof typeof DEVBOX_RUNTIME_ICONS] ||
    DEVBOX_DEFAULT_ICON;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt="Devbox Icon"
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Devbox
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {devbox_name.length > 15
                  ? `${devbox_name.slice(0, 15)}...`
                  : devbox_name}
              </span>
            </div>
          </div>
        </div>
        {runtime && runtime !== "default" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Runtime:{" "}
              <span className="font-mono text-foreground">
                {runtime.charAt(0).toUpperCase() + runtime.slice(1)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
