"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  CircleCheckBig,
  Image as ImageIcon,
  Check,
  Sparkles,
} from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import BaseActionMessage from "../../../components/base-action-message";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";

interface LaunchpadUpdateImageProps {
  target: BuiltinResourceTarget;
}

export default function LaunchpadUpdateImage({
  target,
}: LaunchpadUpdateImageProps) {
  const [image, setImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);
  const hasInitialized = React.useRef(false);

  const { launchpad } = useTRPCClients();
  const updateLaunchpad = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  // Get current resource status using the hook
  const { resource, isLoading, error } = useResourceStatus(target);

  // Get current image from resource (only for display, not for state sync)
  const currentImage = resource
    ? LaunchpadObjectSchema.parse(resource).image
    : undefined;

  // Set initial value from current resource when data is loaded (only once)
  React.useEffect(() => {
    if (resource && !hasInitialized.current) {
      setImage(LaunchpadObjectSchema.parse(resource).image);
      hasInitialized.current = true;
    }
  }, [resource]);

  const handleSubmit = async () => {
    if (isSubmitting || !image.trim()) return;

    setIsSubmitting(true);

    try {
      const updateRequest = {
        name: target.name!,
        request: {
          image: image.trim(),
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest);

      // Mark update as completed
      setIsUpdateCompleted(true);
    } catch (error) {
      console.error("Failed to update launchpad image:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: ImageIcon,
          name: "Update Launchpad Image",
        }}
      >
        <div className="p-4">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Loading current image configuration...
            </div>
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  // Show error state
  if (error) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: ImageIcon,
          name: "Update Launchpad Image",
        }}
      >
        <div className="p-4">
          <div className="text-center space-y-4">
            <div className="text-red-600 font-medium">
              Error loading resource: {error.message}
            </div>
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  // Show success message when update is completed
  if (isUpdateCompleted) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: ImageIcon,
          name: "Update Launchpad Image",
        }}
      >
        <div className="p-4">
          <div className="text-center space-y-4">
            <div className="font-medium flex items-center gap-2">
              <CircleCheckBig className="w-4 h-4" />
              Launchpad image updated successfully!
            </div>
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: ImageIcon,
        name: "Update Image",
      }}
      headerSlot={
        <Button
          onClick={handleSubmit}
          size="sm"
          variant="outline"
          disabled={isSubmitting || !image.trim()}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          <Sparkles className="w-3 h-3 text-theme-blue" />
          Apply
        </Button>
      }
    >
      <div className="b">
        {/* Image Input */}
        <div className="space-y-3">
          <Label className="font-medium">New Image:</Label>
          <Input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Enter image URL (e.g., nginx:latest)"
            className="w-full"
          />
          {currentImage && (
            <div className="text-sm text-muted-foreground">
              Current: {currentImage}
            </div>
          )}
        </div>
      </div>
    </BaseActionMessage>
  );
}
