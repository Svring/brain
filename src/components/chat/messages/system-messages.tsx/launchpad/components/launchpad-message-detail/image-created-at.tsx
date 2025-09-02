import React, { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface ImageCreatedAtProps {
  target: BuiltinResourceTarget;
  image?: string;
  createdAt?: string;
  onImageUpdate: (type: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export const ImageCreatedAt: React.FC<ImageCreatedAtProps> = ({
  target,
  image,
  createdAt,
  onImageUpdate,
  isLoading = false,
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
    await onImageUpdate("image", { image: imageValue });
    setIsEditingImage(false);
    setImageValue("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Image Info */}
      {image && (
        <div className="flex flex-col space-y-1 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Image</span>
            <button
              onClick={handleImageEdit}
              className="h-5 w-5 p-0 bg-transparent border-none cursor-pointer flex items-center justify-center hover:bg-muted rounded-sm transition-colors"
              title="Edit image"
            >
              <Edit3 className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground" />
            </button>
          </div>
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner variant="bars" className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
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
              className="cursor-pointer hover:underline transition-colors"
              onClick={handleImageEdit}
              title="Click to edit image"
            >
              <span className="font-medium truncate">{image}</span>
            </div>
          )}
        </div>
      )}

      {/* Created At Info */}
      {createdAt && (
        <div className="flex flex-col space-y-1 flex-1">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium truncate">{createdAt}</span>
        </div>
      )}
    </div>
  );
};
