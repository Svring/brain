import React, { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

interface LaunchpadImageProps {
  image?: string;
  onImageUpdate: (type: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export const LaunchpadImage: React.FC<LaunchpadImageProps> = ({
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

  if (isEditingImage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Image</span>
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
        </div>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center gap-1 group">
        <span className="text-sm text-muted-foreground">Image</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 opacity-40 transition-opacity group-hover:opacity-100"
          onClick={handleImageEdit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner variant="bars" className="h-3 w-3" />
          ) : (
            <Edit3 className="h-3 w-3" />
          )}
          <span className="sr-only">Edit image</span>
        </Button>
      </div>
      <span className="text-sm font-medium truncate">{image || "N/A"}</span>
    </div>
  );
};
