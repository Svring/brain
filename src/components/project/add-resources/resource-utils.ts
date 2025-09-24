import { nanoid } from "@/lib/utils";

// Sanitize name for DNS compliance
export const sanitizeName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
};

// Generate default names
export const generateDefaultName = (type: "devbox" | "database" | "app") => {
  const id = nanoid();
  return sanitizeName(`${type}-${id}`);
};
