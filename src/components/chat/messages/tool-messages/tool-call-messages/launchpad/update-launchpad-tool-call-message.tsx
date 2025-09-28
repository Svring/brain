import { Slider } from "@/components/ui/slider";

interface UpdateLaunchpadToolCallMessageProps {
  launchpad_name: string;
  image?: string;
  cpu?: 1 | 2 | 4 | 8 | 16;
  memory?: 1 | 2 | 4 | 8 | 16 | 32;
}

// CPU options for launchpad
const LAUNCHPAD_CPU_OPTIONS = [1, 2, 4, 8, 16] as const;

// Memory options for launchpad
const LAUNCHPAD_MEMORY_OPTIONS = [1, 2, 4, 8, 16, 32] as const;

export function UpdateLaunchpadToolCallMessage({
  launchpad_name,
  image,
  cpu,
  memory,
}: UpdateLaunchpadToolCallMessageProps) {
  const iconUrl = "https://applaunchpad.bja.sealos.run/logo.svg";

  // Get current indices for sliders
  const cpuIndex =
    cpu !== undefined
      ? LAUNCHPAD_CPU_OPTIONS.findIndex((option) => option === cpu)
      : -1;
  const memoryIndex =
    memory !== undefined
      ? LAUNCHPAD_MEMORY_OPTIONS.findIndex((option) => option === memory)
      : -1;

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
                {launchpad_name.length > 15
                  ? `${launchpad_name.slice(0, 15)}...`
                  : launchpad_name}
              </span>
            </div>
          </div>
        </div>
        {(cpu !== undefined || memory !== undefined) && (
          <div className="space-y-3">
            {cpu !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    CPU:
                  </span>
                  <span className="text-sm text-foreground font-mono">
                    {cpu}Core
                  </span>
                </div>
                <div className="space-y-1">
                  <Slider
                    value={[cpuIndex]}
                    min={0}
                    max={LAUNCHPAD_CPU_OPTIONS.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="CPU slider"
                    disabled
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {LAUNCHPAD_CPU_OPTIONS[0]}C
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {LAUNCHPAD_CPU_OPTIONS[LAUNCHPAD_CPU_OPTIONS.length - 1]}C
                    </span>
                  </div>
                </div>
              </div>
            )}
            {memory !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Memory:
                  </span>
                  <span className="text-sm text-foreground font-mono">
                    {memory}G
                  </span>
                </div>
                <div className="space-y-1">
                  <Slider
                    value={[memoryIndex]}
                    min={0}
                    max={LAUNCHPAD_MEMORY_OPTIONS.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Memory slider"
                    disabled
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {LAUNCHPAD_MEMORY_OPTIONS[0]}G
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {
                        LAUNCHPAD_MEMORY_OPTIONS[
                          LAUNCHPAD_MEMORY_OPTIONS.length - 1
                        ]
                      }
                      G
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
