import { z } from "zod";

export const ConfigMapSchema = z.object({
  path: z.string().min(1, "Mount path is required"),
  value: z.string().optional(),
});

// Schema for array of config maps with unique path validation
export const ConfigMapArraySchema = z.array(ConfigMapSchema).refine(
  (configMaps) => {
    const paths = configMaps.map((configMap) => configMap.path);
    const uniquePaths = new Set(paths);
    return paths.length === uniquePaths.size;
  },
  {
    message: "Each config map path must be unique",
  }
);

export type ConfigMap = z.infer<typeof ConfigMapSchema>;
