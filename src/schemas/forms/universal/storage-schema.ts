import { z } from "zod";

export const storageSizeOptions = ["1Gi", "5Gi", "10Gi", "20Gi"] as const;

export const StorageSchema = z.object({
  path: z.string().min(1, "Mount path is required"),
  size: z.enum(storageSizeOptions).default("1Gi"),
});

// Schema for array of storage with unique path validation
export const StorageArraySchema = z.array(StorageSchema).refine(
  (storages) => {
    const paths = storages.map((storage) => storage.path);
    const uniquePaths = new Set(paths);
    return paths.length === uniquePaths.size;
  },
  {
    message: "Each storage path must be unique",
  }
);

export type Storage = z.infer<typeof StorageSchema>;
