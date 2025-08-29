"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUpdateLaunchpadMutation } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import {
  CircleCheckBig,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";

interface UpdateImageFormProps {
  initialValues: {
    name: string;
    image?: string;
  };
  onSubmit: (values: { name: string; image: string }) => void;
  context: SealosApiContext;
}

export function UpdateImageForm({
  initialValues,
  onSubmit,
  context,
}: UpdateImageFormProps) {
  const [image, setImage] = useState<string>(initialValues.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);

  const updateLaunchpad = useUpdateLaunchpadMutation(context);

  const handleSubmit = async () => {
    if (isSubmitting || !image.trim()) return;

    setIsSubmitting(true);

    try {
      const updateRequest = {
        name: initialValues.name,
        data: {
          image: image.trim(),
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest);

      // Call the onSubmit callback with the updated values
      onSubmit({
        name: initialValues.name,
        image: image.trim(),
      });

      // Mark update as completed
      setIsUpdateCompleted(true);
    } catch (error) {
      console.error("Failed to update launchpad image:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message when update is completed
  if (isUpdateCompleted) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: ImageIcon,
          name: "Update Launchpad Image",
        }}
      >
        <div className="text-center space-y-4">
          <div className="font-medium flex items-center gap-2">
            <CircleCheckBig className="w-4 h-4" />
            Launchpad image updated successfully!
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
      {/* Image Input */}
      <div className="space-y-2">
        <Label className="font-medium">New Image:</Label>
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Enter image URL (e.g., nginx:latest)"
          className="w-full"
        />
      </div>
    </BaseActionMessage>
  );
}
