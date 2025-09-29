import { useState, useEffect } from "react";

interface UpdateLaunchpadImageToolCallMessageProps {
  launchpad_name: string;
  image: string;
  setInterruptData?: (data: any) => void;
}

export function UpdateLaunchpadImageToolCallMessage({
  launchpad_name,
  image,
  setInterruptData,
}: UpdateLaunchpadImageToolCallMessageProps) {
  // State to track current value for interactive input
  const [currentImage, setCurrentImage] = useState(image);

  // Update state when props change
  useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  // Handle image change to update interrupt data
  const handleImageChange = (newImage: string) => {
    setCurrentImage(newImage);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          image: newImage,
        },
      }));
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Image:
        </span>
        <input
          type="text"
          value={currentImage}
          onChange={(e) => handleImageChange(e.target.value)}
          className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
          placeholder="Enter image name..."
          disabled={!setInterruptData}
        />
      </div>
    </div>
  );
}
