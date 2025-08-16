"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ObjectStorageConfigProps {
  configData: any;
  onConfigChange: (field: string, value: any) => void;
}

export default function ObjectStorageConfig({ configData, onConfigChange }: ObjectStorageConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="storage-name">Bucket Name</Label>
        <Input
          id="storage-name"
          placeholder="Enter storage bucket name"
          value={configData.name || ""}
          onChange={(e) => onConfigChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storage-policy">Bucket Policy</Label>
        <Select
          value={configData.policy || ""}
          onValueChange={(value) => onConfigChange("policy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select bucket policy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="publicRead">Public Read</SelectItem>
            <SelectItem value="publicReadWrite">Public Read/Write</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
