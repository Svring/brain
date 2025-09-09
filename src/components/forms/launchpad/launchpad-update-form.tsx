"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLaunchpadUpdateForm } from "@/hooks/forms/launchpad/use-launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadResourceFields } from "./launchpad-resource-fields";
import { LaunchpadPortsFields } from "./launchpad-ports-fields";
import { LaunchpadSimplePortsFields } from "./launchpad-simple-ports-fields";
import { toast } from "sonner";

interface LaunchpadUpdateFormProps {
  defaultValues?: Partial<LaunchpadUpdateFormData>;
  onSubmit: (data: LaunchpadUpdateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
  useSimplePortsMode?: boolean;
}

export const LaunchpadUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
  useSimplePortsMode = false,
}: LaunchpadUpdateFormProps) => {
  const { form, portsFieldArray, simplePortsFieldArray } =
    useLaunchpadUpdateForm(defaultValues);

  const handleSubmit = (data: LaunchpadUpdateFormData) => {
    onSubmit(data);
  };

  const handleSubmitError = (errors: any) => {
    // Handle form validation errors
    if (errors.ports) {
      toast.error(
        "Port validation failed. Please check for duplicate port numbers."
      );
    } else if (errors.simplePorts) {
      toast.error(
        "Port operations validation failed. Please check for duplicate port numbers."
      );
    } else {
      toast.error("Form validation failed. Please check your inputs.");
    }
  };

  // Only show fields that have values in defaultValues
  const hasResource = defaultValues?.resource !== undefined;
  const hasPorts = defaultValues?.ports !== undefined;
  const hasSimplePorts = defaultValues?.simplePorts !== undefined;

  // Determine which ports field to show
  const showSimplePortsField = useSimplePortsMode || hasSimplePorts;
  const showRegularPortsField = hasPorts && !showSimplePortsField;

  return (
    <Form {...form}>
      <form
        id="launchpad-update-form"
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        {hasResource && <LaunchpadResourceFields />}

        {showRegularPortsField && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Ports</div>
            <LaunchpadPortsFields fieldArray={portsFieldArray} />
          </div>
        )}

        {showSimplePortsField && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Port Operations
            </div>
            <LaunchpadSimplePortsFields fieldArray={simplePortsFieldArray} />
          </div>
        )}

        {!hideDefaultButton && (
          <div className="flex justify-end">
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
