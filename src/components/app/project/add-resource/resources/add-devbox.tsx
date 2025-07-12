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
  const [name, setName] = useState("");
  const [created, setCreated] = useState<string | null>(null);

  // Create the context and mutation hook
  const devboxContext = createDevboxContext(user!);
  const createDevboxMutation = useCreateDevboxMutation(devboxContext);

  const handleCreate = () => {
    if (!name) return;

    const req: DevboxCreateRequest = {
      name: name || generateDevboxName(),
      runtimeName: selected,
      cpu: 2000,
      memory: 4096,
    };

    createDevboxMutation.mutate(req, {
      onSuccess: () => {
        setCreated(name);
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
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium">DevBox Name</label>
        <input
          className="border rounded px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter devbox name"
        />
      </div>
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
        disabled={createDevboxMutation.isPending || !name || created === name}
      >
        {created === name
          ? "Created"
          : createDevboxMutation.isPending
          ? "Creating..."
          : "Create DevBox"}
      </Button>
    </div>
  );
}
