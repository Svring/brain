import { z } from "zod";
import { STORAGE_OPTIONS } from "@/lib/k8s/k8s-constant/k8s-constant-resource";

// Storage size options for launchpad (convert GB to GiB format, limited to 20Gi)
export const storageSizeOptions = STORAGE_OPTIONS.filter(
  (size) => size <= 20
).map((size) => `${size}Gi`) as readonly string[];

// Storage configuration schema
export const StorageSchema = z.object({
  path: z.string(),
  size: z.string().refine((val) => storageSizeOptions.includes(val), {
    message: `Size must be one of: ${storageSizeOptions.join(", ")}`,
  }),
});

export type Storage = z.infer<typeof StorageSchema>;
