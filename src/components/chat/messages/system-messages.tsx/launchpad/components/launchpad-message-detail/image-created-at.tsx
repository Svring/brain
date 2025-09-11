import React, { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

interface ImageCreatedAtProps {
  target: BuiltinResourceTarget;
  image?: string;
  onImageUpdate: (type: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export const ImageCreatedAt: React.FC<ImageCreatedAtProps> = ({
  target,
  image,
  onImageUpdate,
  isLoading = false,
}) => {
  const [isEditingImage, setIsEditingImage] = useState(false);

  const handleImageEdit = () => {
    setIsEditingImage(true);
  };

  const handleImageCancel = () => {
    setIsEditingImage(false);
  };

  const handleImageSubmit = async (data: LaunchpadUpdateFormData) => {
    // Handle image registry: if all registry fields are empty strings, set to null
    let imageRegistry = data.image?.imageRegistry;
    if (imageRegistry) {
      const { username, password, serverAddress } = imageRegistry;
      if (!username && !password && !serverAddress) {
        imageRegistry = null;
      }
    }

    await onImageUpdate("image", {
      image: {
        imageName: data.image?.imageName,
        imageRegistry: imageRegistry,
      },
    });
    setIsEditingImage(false);
  };

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Image</h3>
        {isEditingImage ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={handleImageCancel}
              disabled={isLoading}
            >
              <X />
            </Button>
            <Button
              type="submit"
              form="launchpad-update-form"
              variant="outline"
              size="sm"
              className="h-8 w-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner variant="bars" className="h-4 w-4" />
              ) : (
                <Check />
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8"
            onClick={handleImageEdit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner variant="bars" className="h-4 w-4" />
            ) : (
              <Edit3 />
            )}
          </Button>
        )}
      </div>
      <div className={`${isEditingImage ? "p-4" : "p-2"}`}>
        {isEditingImage ? (
          <LaunchpadUpdateForm
            defaultValues={{
              image: {
                imageName: image || "",
                imageRegistry: null,
              },
            }}
            onSubmit={handleImageSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Image Info */}
            {image && (
              <div className="flex flex-col space-y-1 flex-1">
                <span className="text-sm text-muted-foreground">Image</span>
                <span className="font-medium truncate">{image}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
