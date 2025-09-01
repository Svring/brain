"use client";

import { LaunchpadCreateForm } from "@/components/forms/launchpad/launchpad-create-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create/launchpad-create-form-schema";
import { useState } from "react";
import { toast } from "sonner";

export default function LaunchpadCreatePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LaunchpadCreateFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log("Submitting launchpad create data:", data);
      
      // Here you would typically make an API call to create the launchpad application
      // const response = await createLaunchpadApplication(data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Launchpad application created successfully!");
      
      // You could redirect to the application details page here
      // router.push(`/launchpad/${data.name}`);
      
    } catch (error) {
      console.error("Error creating launchpad application:", error);
      toast.error("Failed to create launchpad application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Launchpad Application</h1>
        <p className="text-muted-foreground mt-2">
          Configure and deploy your application to the launchpad platform.
        </p>
      </div>
      
      <LaunchpadCreateForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
