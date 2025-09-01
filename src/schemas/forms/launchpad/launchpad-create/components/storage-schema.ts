import { z } from "zod";
import { STORAGE_OPTIONS } from "@/lib/k8s/k8s-constant/k8s-constant-resource";

// Storage size options for launchpad (convert GB to GiB format)
export const storageSizeOptions = STORAGE_OPTIONS.map(
  (size) => `${size}Gi`
) as readonly string[];

// Storage configuration schema
export const StorageSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z
    .string()
    .refine((val) => storageSizeOptions.includes(val), {
      message: `Size must be one of: ${storageSizeOptions.join(", ")}`,
    })
    .default("1Gi"),
});

export type Storage = z.infer<typeof StorageSchema>;
