"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LaunchpadPortsCreateRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { CircleCheckBig, Network, Sparkles } from "lucide-react";
import BaseSystemMessage from "@/components/chat/messages/system-messages.tsx/components/base-system-message";

interface AddPortsFormProps {
  initialValues: {
    name: string;
    ports: Array<{
      port: number;
      protocol: "TCP" | "UDP" | "SCTP";
      appProtocol?: "HTTP" | "GRPC" | "WS";
      exposesPublicDomain: boolean;
    }>;
  };
  onSubmit: (values: { name: string; ports: any[] }) => void;
  context: SealosApiContext;
}

export function AddPortsForm({ initialValues, onSubmit, context }: AddPortsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);
  const { launchpad } = useTRPCClients();
  const queryClient = useQueryClient();

  console.log(initialValues);
  
  const createLaunchpadPorts = useMutation(
    launchpad.createPorts.mutationOptions()
  );

  const form = useForm({
    resolver: zodResolver(LaunchpadPortsCreateRequestSchema),
    defaultValues: {
      ports: initialValues.ports.length > 0 ? initialValues.ports : [{
        port: 80,
        protocol: "TCP" as const,
        appProtocol: "HTTP" as const,
        exposesPublicDomain: false,
      }],
    },
  });

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const values = form.getValues();
      const request = {
        name: initialValues.name,
        request: values,
      };

      await createLaunchpadPorts.mutateAsync(request);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: launchpad.get.queryKey({ name: initialValues.name }),
      });

      toast.success("Ports added successfully!");
      onSubmit({ name: initialValues.name, ports: values.ports });
      setIsUpdateCompleted(true);
    } catch (error) {
      console.error("Failed to add ports:", error);
      toast.error("Failed to add ports");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message when update is completed
  if (isUpdateCompleted) {
    return (
      <BaseSystemMessage
        headerTitle={{
          icon: Network,
          name: "Add Launchpad Ports",
        }}
      >
        <div className="text-center space-y-4">
          <div className="font-medium flex items-center gap-2">
            <CircleCheckBig className="w-4 h-4" />
            Launchpad ports added successfully!
          </div>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage
      headerTitle={{
        icon: Network,
        name: "Add Ports",
      }}
      headerSlot={
        <Button
          onClick={handleSubmit}
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          <Sparkles className="w-3 h-3 text-theme-blue" />
          Apply
        </Button>
      }
    >
      <Form {...form}>
        <form className="space-y-4">
          {form.watch("ports").map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`ports.${index}.port`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-sm font-medium">Port Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="80"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`ports.${index}.exposesPublicDomain`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">Public Access</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </form>
      </Form>
    </BaseSystemMessage>
  );
}
