import { z } from "zod";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";

export const DevboxRuntimeSchema = z.enum(DEVBOX_RUNTIMES);

export type DevboxRuntime = z.infer<typeof DevboxRuntimeSchema>;
