"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import {
  launchpadCreateFormSchema,
  LaunchpadCreateFormData,
} from "@/schemas/forms/launchpad/launchpad-create-form-schema";

export const useLaunchpadCreateForm = (
  defaultValues?: Partial<LaunchpadCreateFormData>
) => {
  const form = useForm<LaunchpadCreateFormData>({
    resolver: zodResolver(launchpadCreateFormSchema),
    defaultValues: {
      name: "hello-world",
      image: "nginx",
      command: "",
      args: "",
      resource: {
        replicas: 1,
        cpu: 0.1,
        memory: 0.5,
      },
      ports: [
        {
          number: 80,
          protocol: "HTTP",
          exposesPublicDomain: true,
        },
      ],
      env: [],
      hpa: null,
      imageRegistry: null,
      storage: [],
      configMap: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Field arrays for dynamic fields
  const portsFieldArray = useFieldArray({
    control: form.control,
    name: "ports",
  });

  const envFieldArray = useFieldArray({
    control: form.control,
    name: "env",
  });

  const storageFieldArray = useFieldArray({
    control: form.control,
    name: "storage",
  });

  const configMapFieldArray = useFieldArray({
    control: form.control,
    name: "configMap",
  });

  return {
    form,
    portsFieldArray,
    envFieldArray,
    storageFieldArray,
    configMapFieldArray,
  };
};
