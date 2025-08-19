"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateDevboxMutation } from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { toast } from "sonner";

interface DevboxCreateMessageProps {
  payload?: {
    name?: string;
    runtimeName?: string;
    cpu?: number;
    memory?: number;
  };
}

export function DevboxCreateMessage({ payload }: DevboxCreateMessageProps) {
  const [name, setName] = useState(payload?.name || "");
  const [runtimeName, setRuntimeName] = useState<string>(payload?.runtimeName || "nodejs");
  const [cpu, setCpu] = useState<number>(payload?.cpu || 2000);
  const [memory, setMemory] = useState<number>(payload?.memory || 4096);
  const [isCreating, setIsCreating] = useState(false);

  const context = createSealosContext();
  const createDevboxMutation = useCreateDevboxMutation(context);

  // Update state when payload changes (for streaming parameters)
  useEffect(() => {
    if (payload?.name !== undefined) {
      setName(payload.name);
    }
    if (payload?.runtimeName !== undefined) {
      setRuntimeName(payload.runtimeName);
    }
    if (payload?.cpu !== undefined) {
      setCpu(payload.cpu);
    }
    if (payload?.memory !== undefined) {
      setMemory(payload.memory);
    }
  }, [payload]);

  const runtimeOptions = [
    { value: "nodejs", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "debian", label: "Debian" },
    { value: "c++", label: "C++" },
    { value: ".net", label: ".NET" },
    { value: "c", label: "C" },
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a devbox name");
      return;
    }

    setIsCreating(true);
    try {
      await createDevboxMutation.mutateAsync({
        name: name.trim(),
        runtimeName: runtimeName as any,
        cpu,
        memory,
      });

      // Reset form
      setName("");
      setRuntimeName("nodejs");
      setCpu(2000);
      setMemory(4096);
      toast.success("Devbox created successfully!");
    } catch (error) {
      console.error("Failed to create devbox:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full bg-node-background border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Create Devbox</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="devbox-name">Name</Label>
          <Input
            id="devbox-name"
            placeholder="Enter devbox name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="runtime">Runtime</Label>
          <Select value={runtimeName} onValueChange={setRuntimeName}>
            <SelectTrigger>
              <SelectValue placeholder="Select runtime" />
            </SelectTrigger>
            <SelectContent>
              {runtimeOptions.map((runtime) => (
                <SelectItem key={runtime.value} value={runtime.value}>
                  {runtime.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpu">CPU (m)</Label>
            <Input
              id="cpu"
              type="number"
              value={cpu}
              onChange={(e) => setCpu(Number(e.target.value))}
              min="100"
              step="100"
              placeholder="2000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory">Memory (Mi)</Label>
            <Input
              id="memory"
              type="number"
              value={memory}
              onChange={(e) => setMemory(Number(e.target.value))}
              min="512"
              step="512"
              placeholder="4096"
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Resource configuration:</p>
          <p>• CPU: {cpu}m ({cpu/1000} cores)</p>
          <p>• Memory: {memory}Mi ({memory/1024}GB)</p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={isCreating || !name.trim()}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Devbox"}
        </Button>
      </CardContent>
    </Card>
  );
}
