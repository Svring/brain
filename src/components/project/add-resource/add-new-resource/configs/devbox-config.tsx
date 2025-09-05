"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";

interface DevboxConfigProps {
  configData: any;
  onConfigChange: (field: string, value: any) => void;
}

export default function DevboxConfig({ configData, onConfigChange }: DevboxConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="devbox-name">Name</Label>
        <Input
          id="devbox-name"
          placeholder="Enter devbox name"
          value={configData.name || ""}
          onChange={(e) => onConfigChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="devbox-runtime">Runtime</Label>
        <Select
          value={configData.runtimeName || ""}
          onValueChange={(value) => onConfigChange("runtimeName", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select runtime" />
          </SelectTrigger>
          <SelectContent>
            {DEVBOX_RUNTIMES.map((runtime) => (
              <SelectItem key={runtime} value={runtime}>
                {runtime}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="devbox-cpu">CPU (m)</Label>
          <Select
            value={configData.cpu || ""}
            onValueChange={(value) => onConfigChange("cpu", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select CPU" />
            </SelectTrigger>
            <SelectContent>
              {[500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000].map((cpu) => (
                <SelectItem key={cpu} value={cpu.toString()}>
                  {cpu}m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="devbox-memory">Memory (MB)</Label>
          <Select
            value={configData.memory || ""}
            onValueChange={(value) => onConfigChange("memory", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Memory" />
            </SelectTrigger>
            <SelectContent>
              {[512, 1024, 1536, 2048, 2560, 3072, 3584, 4096, 4608, 5120, 5632, 6144, 6656, 7168, 7680, 8192].map((memory) => (
                <SelectItem key={memory} value={memory.toString()}>
                  {memory} MB
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
