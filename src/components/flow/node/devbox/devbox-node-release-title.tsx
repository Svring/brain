"use client";

import { Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface DevboxNodeReleaseTitleProps {
  releasesCount: number;
  devboxName: string;
  onRelease: (config: { tag: string; releaseDes: string }) => Promise<void>;
  isReleasing: boolean;
}

export default function DevboxNodeReleaseTitle({
  releasesCount,
  devboxName,
  onRelease,
  isReleasing,
}: DevboxNodeReleaseTitleProps) {
  const [releaseConfig, setReleaseConfig] = useState({
    tag: "",
    releaseDes: "",
  });
  const [isReleasePopoverOpen, setIsReleasePopoverOpen] = useState(false);

  const handleRelease = async () => {
    try {
      await onRelease(releaseConfig);
      setIsReleasePopoverOpen(false);
      setReleaseConfig({ tag: "", releaseDes: "" });
    } catch (error) {
      console.error("Release failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          Releases: {releasesCount}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Popover
          open={isReleasePopoverOpen}
          onOpenChange={setIsReleasePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
              }}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 z-[9999]"
            side="top"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
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
                      setReleaseConfig((prev) => ({
                        ...prev,
                        tag: e.target.value,
                      }))
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
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
                      setReleaseConfig((prev) => ({
                        ...prev,
                        releaseDes: e.target.value,
                      }))
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReleasePopoverOpen(false);
                    setReleaseConfig({ tag: "", releaseDes: "" });
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRelease();
                  }}
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  disabled={isReleasing || !releaseConfig.tag.trim()}
                >
                  {isReleasing ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            // Add maximize functionality here
          }}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}