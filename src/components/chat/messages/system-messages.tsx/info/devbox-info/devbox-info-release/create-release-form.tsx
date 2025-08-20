import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReleaseConfig {
  tag: string;
  releaseDes: string;
}

interface CreateReleaseFormProps {
  devboxName: string;
  releaseConfig: ReleaseConfig;
  setReleaseConfig: (config: ReleaseConfig) => void;
  onCancel: () => void;
  onSubmit: (config: ReleaseConfig) => void;
  isPending: boolean;
}

export const CreateReleaseForm: React.FC<CreateReleaseFormProps> = ({
  devboxName,
  releaseConfig,
  setReleaseConfig,
  onCancel,
  onSubmit,
  isPending,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Create Release</h4>
        <p className="text-xs text-muted-foreground">
          Create a new release for {devboxName}
        </p>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="release-tag" className="text-xs">
            Tag *
          </Label>
          <Input
            id="release-tag"
            type="text"
            placeholder="v1.0.0"
            value={releaseConfig.tag}
            onChange={(e) =>
              setReleaseConfig({
                ...releaseConfig,
                tag: e.target.value,
              })
            }
            className="h-8 text-xs"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="release-description" className="text-xs">
            Description
          </Label>
          <Input
            id="release-description"
            type="text"
            placeholder="Release description (optional)"
            value={releaseConfig.releaseDes}
            onChange={(e) =>
              setReleaseConfig({
                ...releaseConfig,
                releaseDes: e.target.value,
              })
            }
            className="h-8 text-xs"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(releaseConfig)}
          size="sm"
          className="flex-1 h-8 text-xs"
          disabled={isPending || !releaseConfig.tag.trim()}
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
};
