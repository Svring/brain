import React, { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { toast } from "sonner";

interface ImageCreatedAtProps {
  target: BuiltinResourceTarget;
  image?: string;
  createdAt?: string;
  onImageUpdate: (type: string, data?: any) => Promise<void>;
}

export const ImageCreatedAt: React.FC<ImageCreatedAtProps> = ({
  target,
  image,
  createdAt,
  onImageUpdate,
}) => {
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageValue, setImageValue] = useState("");

  const handleImageEdit = () => {
    setIsEditingImage(true);
    setImageValue(image || "");
  };

  const handleImageCancel = () => {
    setIsEditingImage(false);
    setImageValue("");
  };

  const handleImageSubmit = async () => {
    if (!imageValue.trim()) return;
    await onImageUpdate("image");
    setIsEditingImage(false);
    setImageValue("");
  };

  return (
    <>
      {/* Image Info */}
      {image && (
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Image</span>
          {isEditingImage ? (
            <div className="flex items-center gap-2">
              <Input
                value={imageValue}
                onChange={(e) => setImageValue(e.target.value)}
                placeholder="Enter image URL (e.g., nginx:latest)"
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImageSubmit();
                  } else if (e.key === "Escape") {
                    handleImageCancel();
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleImageSubmit}
                className="h-8 w-8 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleImageCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div
              className="group flex items-center gap-2 cursor-pointer hover:underline transition-colors"
              onClick={handleImageEdit}
              title="Click to edit image"
            >
              <span className="font-medium truncate">{image}</span>
              <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      )}

      {/* Created At Info */}
      {createdAt && (
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium truncate">{createdAt}</span>
        </div>
      )}
    </>
  );
};
