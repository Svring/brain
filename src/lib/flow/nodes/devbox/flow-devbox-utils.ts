import type { z } from "zod";
import type { DevboxInfoSchema } from "@/lib/sealos/devbox/schemas/devbox-query-schema";

export interface DevboxNodeData {
  name: string;
  type: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating";
  icon: string;
}

type DevboxInfo = z.infer<typeof DevboxInfoSchema>;

function extractRuntimeType(imageName: string): string {
  const lowerImageName = imageName.toLowerCase();

  if (lowerImageName.includes("python")) return "Python";
  if (lowerImageName.includes("node")) return "Node.js";
  if (lowerImageName.includes("go")) return "Go";
  if (lowerImageName.includes("java")) return "Java";
  if (lowerImageName.includes("rust")) return "Rust";
  if (lowerImageName.includes("cpp") || lowerImageName.includes("c++"))
    return "C++";
  if (lowerImageName.includes("php")) return "PHP";
  if (lowerImageName.includes("dotnet") || lowerImageName.includes(".net"))
    return ".Net";
  if (lowerImageName.includes("debian")) return "Debian";

  return "DevBox";
}

function getDevboxState(
  status: string
): "Running" | "Stopped" | "Unknown" | "Creating" {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus === "running") return "Running";
  if (lowerStatus === "stopped" || lowerStatus === "error") return "Stopped";
  if (lowerStatus === "creating" || lowerStatus === "pending")
    return "Creating";

  return "Unknown";
}

function getIconForType(type: string): string {
  switch (type) {
    case "Python":
      return "/python-icon.png";
    case "Node.js":
      return "/nodejs-icon.png";
    case "Go":
      return "/go-icon.png";
    case "Java":
      return "/java-icon.png";
    case "Rust":
      return "/rust-icon.png";
    case "C++":
      return "/cpp-icon.png";
    case "PHP":
      return "/php-icon.png";
    case ".Net":
      return "/dotnet-icon.png";
    case "Debian":
      return "/debian-icon.png";
    default:
      return "/default-devbox-icon.png";
  }
}

export function convertDevboxInfoToNodeData(
  devboxInfo: DevboxInfo
): DevboxNodeData {
  const name = devboxInfo.name;
  const type = devboxInfo.imageName
    ? extractRuntimeType(devboxInfo.imageName)
    : "DevBox";
  const state = getDevboxState(devboxInfo.status);
  const icon = getIconForType(type);

  return {
    name,
    type,
    state,
    icon,
  };
}
