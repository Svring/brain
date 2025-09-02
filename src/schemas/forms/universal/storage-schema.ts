import { z } from "zod";

export const storageSizeOptions = ["1Gi", "5Gi", "10Gi", "20Gi"] as const;

export const StorageSchema = z.object({
  path: z.string().min(1, "Mount path is required"),
  size: z.enum(storageSizeOptions).default("1Gi"),
});

export type Storage = z.infer<typeof StorageSchema>;
