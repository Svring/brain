"use client";

import { use, useState } from "react";
import type {
  DevboxCreateRequest,
  RuntimeName,
} from "@/lib/sealos/devbox/schemas/devbox-lifecycle-schema";
import { RuntimeNameSchema } from "@/lib/sealos/devbox/schemas/devbox-lifecycle-schema";
import { Button } from "@/components/ui/button";
import {
  createDevboxContext,
  generateDevboxName,
} from "@/lib/sealos/devbox/devbox-utils";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useCreateDevboxMutation } from "@/lib/sealos/devbox/devbox-method/devbox-mutation";

const RUNTIME_OPTIONS = RuntimeNameSchema.options;

export default function AddDevbox() {
  const { user } = use(AuthContext);
  const [selected, setSelected] = useState<RuntimeName>(RUNTIME_OPTIONS[0]);
  const [created, setCreated] = useState<boolean>(false);

  // Create the context and mutation hook
  const devboxContext = createDevboxContext(user!);
  const createDevboxMutation = useCreateDevboxMutation(devboxContext);

  const handleCreate = () => {
    const req: DevboxCreateRequest = {
      name: generateDevboxName(),
      runtimeName: selected,
      cpu: 2000,
      memory: 4096,
    };

    createDevboxMutation.mutate(req, {
      onSuccess: () => {
        setCreated(true);
      },
      onError: (error) => {
        console.error("Failed to create devbox:", error);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Select a runtime and enter a name to create a DevBox:
      </div>
      {/* No name input - autogenerated */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium">Runtime</label>
        <div className="flex flex-wrap gap-2">
          {RUNTIME_OPTIONS.map((runtime) => (
            <Button
              key={runtime}
              size="sm"
              variant={selected === runtime ? "default" : "outline"}
              onClick={() => setSelected(runtime as RuntimeName)}
              type="button"
            >
              {runtime}
            </Button>
          ))}
        </div>
      </div>
      <Button
        className="mt-2"
        onClick={handleCreate}
        disabled={createDevboxMutation.isPending || created}
      >
        {created
          ? "Created"
          : createDevboxMutation.isPending
          ? "Creating..."
          : "Create DevBox"}
      </Button>
    </div>
  );
}
