import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface UpdateLaunchpadToolCallMessageProps {
  launchpad_name: string;
  image?: string;
  cpu?: 1 | 2 | 4 | 8 | 16;
  memory?: 1 | 2 | 4 | 8 | 16 | 32;
  setInterruptData?: (data: any) => void;
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
  setInterruptData,
}: UpdateLaunchpadToolCallMessageProps) {
  const iconUrl = "https://applaunchpad.bja.sealos.run/logo.svg";

  // State to track current values for interactive sliders
  const [currentCpu, setCurrentCpu] = useState(cpu);
  const [currentMemory, setCurrentMemory] = useState(memory);

  // Update state when props change
  useEffect(() => {
    setCurrentCpu(cpu);
  }, [cpu]);

  useEffect(() => {
    setCurrentMemory(memory);
  }, [memory]);

  // Get current indices for sliders
  const cpuIndex =
    currentCpu !== undefined
      ? LAUNCHPAD_CPU_OPTIONS.findIndex((option) => option === currentCpu)
      : -1;
  const memoryIndex =
    currentMemory !== undefined
      ? LAUNCHPAD_MEMORY_OPTIONS.findIndex((option) => option === currentMemory)
      : -1;

  // Handle slider changes to update interrupt data
  const handleCpuChange = (newCpuIndex: number) => {
    const newCpu = LAUNCHPAD_CPU_OPTIONS[newCpuIndex];
    setCurrentCpu(newCpu);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          cpu: newCpu,
        },
      }));
    }
  };

  const handleMemoryChange = (newMemoryIndex: number) => {
    const newMemory = LAUNCHPAD_MEMORY_OPTIONS[newMemoryIndex];
    setCurrentMemory(newMemory);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          memory: newMemory,
        },
      }));
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        {(cpu !== undefined || memory !== undefined) && (
          <div className="space-y-3">
            {cpu !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    CPU:
                  </span>
                  <span className="text-sm text-foreground font-mono">
                    {currentCpu}Core
                  </span>
                </div>
                <div className="space-y-1">
                  <Slider
                    value={[cpuIndex]}
                    min={0}
                    max={LAUNCHPAD_CPU_OPTIONS.length - 1}
                    step={1}
                    onValueChange={(value) => handleCpuChange(value[0])}
                    className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="CPU slider"
                    disabled={!setInterruptData}
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
                    {currentMemory}G
                  </span>
                </div>
                <div className="space-y-1">
                  <Slider
                    value={[memoryIndex]}
                    min={0}
                    max={LAUNCHPAD_MEMORY_OPTIONS.length - 1}
                    step={1}
                    onValueChange={(value) => handleMemoryChange(value[0])}
                    className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Memory slider"
                    disabled={!setInterruptData}
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
