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
import { generateDevboxName } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { toast } from "sonner";
import { CheckCircle, Package } from "lucide-react";

interface DevboxCreateMessageProps {
  payload?: {
    name?: string;
    runtimeName?: string;
    cpu?: number;
    memory?: number;
  };
}

export function DevboxCreateMessage({ payload }: DevboxCreateMessageProps) {
  const [name, setName] = useState(payload?.name || generateDevboxName());
  const [runtimeName, setRuntimeName] = useState<string>(
    payload?.runtimeName || "Node.js"
  );
  const [cpu, setCpu] = useState<number>(payload?.cpu || 500);
  const [memory, setMemory] = useState<number>(payload?.memory || 512);
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdDevboxName, setCreatedDevboxName] = useState<string>("");

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
    { value: "Node.js", label: "Node.js" },
    { value: "Python", label: "Python" },
    { value: "Java", label: "Java" },
    { value: "Go", label: "Go" },
    { value: "Rust", label: "Rust" },
    { value: "PHP", label: "PHP" },
    { value: "Debian", label: "Debian" },
    { value: "C++", label: "C++" },
    { value: ".Net", label: ".NET" },
    { value: "C", label: "C" },
  ];

  const handleCreate = async () => {
    const devboxName = name.trim() || generateDevboxName();
    
    setIsCreating(true);
    try {
      await createDevboxMutation.mutateAsync({
        name: devboxName,
        runtimeName: runtimeName as any,
        cpu,
        memory,
      });

      // Set completion state
      setCreatedDevboxName(devboxName);
      setIsCompleted(true);
      toast.success("Devbox created successfully!");
    } catch (error) {
      console.error("Failed to create devbox:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="w-full bg-node-background border border-border-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Devbox Created Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {createdDevboxName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Runtime: {runtimeName} • CPU: {cpu}m • Memory: {memory}Mi
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Your devbox is now ready to use. You can access it from the project dashboard.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <Select
              value={cpu.toString()}
              onValueChange={(value) => setCpu(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CPU" />
              </SelectTrigger>
              <SelectContent>
                {[500, 1000, 2000, 4000, 6000, 8000].map((cpuValue) => (
                  <SelectItem key={cpuValue} value={cpuValue.toString()}>
                    {cpuValue}m ({cpuValue / 1000} cores)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory">Memory (Mi)</Label>
            <Select
              value={memory.toString()}
              onValueChange={(value) => setMemory(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Memory" />
              </SelectTrigger>
              <SelectContent>
                {[512, 1024, 2048, 4096, 8192, 16000].map((memoryValue) => (
                  <SelectItem key={memoryValue} value={memoryValue.toString()}>
                    {memoryValue}Mi ({memoryValue / 1024}GB)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Resource configuration:</p>
          <p>
            • CPU: {cpu}m ({cpu / 1000} cores)
          </p>
          <p>
            • Memory: {memory}Mi ({memory / 1024}GB)
          </p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Devbox"}
        </Button>
      </CardContent>
    </Card>
  );
}
