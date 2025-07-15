"use client";

import { useState } from "react";
import type { RuntimeName } from "@/lib/sealos/devbox/schemas/devbox-lifecycle-schema";
import { RuntimeNameSchema } from "@/lib/sealos/devbox/schemas/devbox-lifecycle-schema";
import { Button } from "@/components/ui/button";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import { useCreateDevboxAction } from "@/lib/sealos/devbox/devbox-action/devbox-action";
import { DEVBOX_RUNTIME_ICON_MAP } from "@/lib/sealos/devbox/devbox-constant";
import { useToggle } from "@reactuses/core";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const RUNTIME_OPTIONS = RuntimeNameSchema.options;

export default function AddDevbox() {
  const [selected, setSelected] = useState<RuntimeName>(RUNTIME_OPTIONS[0]);
  const [loading, toggleLoading] = useToggle(false);

  // Create the context and mutation hook
  const devboxContext = createDevboxContext();
  const createDevboxAction = useCreateDevboxAction(devboxContext);

  const handleCreate = () => {
    toggleLoading(true);
    createDevboxAction.mutate(
      {
        runtimeName: selected,
      },
      {
        onSuccess: () => {
          toggleLoading(false);
          toast.success("Devbox created successfully");
        },
        onError: (error) => {
          console.error("Failed to create devbox:", error);
          toggleLoading(false);
          toast.error("Failed to create devbox");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Select Runtime Environment
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {RUNTIME_OPTIONS.map((runtime) => (
            <Button
              key={runtime}
              size="sm"
              variant={selected === runtime ? "default" : "outline"}
              onClick={() => setSelected(runtime as RuntimeName)}
              type="button"
              className="flex flex-col items-center justify-center gap-2 h-20 p-3 text-center"
            >
              <img
                src={DEVBOX_RUNTIME_ICON_MAP[runtime]}
                alt={`${runtime} icon`}
                width={28}
                height={28}
                className="rounded"
              />
              <span className="text-xs font-medium leading-tight break-words">
                {runtime}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t">
        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={loading}
          size="sm"
        >
          {loading ? "Creating..." : "Create DevBox"}
        </Button>
      </div>
    </div>
  );
}
