import {
  DEVBOX_RUNTIME_ICONS,
  DEVBOX_DEFAULT_ICON,
} from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { Separator } from "@/components/ui/separator";

interface CreateDevboxToolCallMessageProps {
  name: string;
  runtime: string;
  cpu?: number;
  memory?: number;
  ports?: number[];
  setInterruptData?: (data: any) => void;
}

export function CreateDevboxToolCallMessage({
  name,
  runtime,
  cpu,
  memory,
  ports,
  setInterruptData,
}: CreateDevboxToolCallMessageProps) {
  // Get icon URL directly from runtime mapping
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
                {name.length > 15 ? `${name.slice(0, 15)}...` : name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Runtime:{" "}
            <span className="font-mono text-foreground">
              {runtime.charAt(0).toUpperCase() + runtime.slice(1)}
            </span>
          </span>
          {cpu && (
            <span className="text-sm text-muted-foreground">
              CPU: <span className="font-mono text-foreground">{cpu}Core</span>
            </span>
          )}
          {memory && (
            <span className="text-sm text-muted-foreground">
              Memory:{" "}
              <span className="font-mono text-foreground">{memory}GB</span>
            </span>
          )}
        </div>
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
    </div>
  );
}
