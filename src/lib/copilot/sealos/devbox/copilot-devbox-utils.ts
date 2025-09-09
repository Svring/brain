import { z } from "zod";
import type { DevboxPort as ExistingDevboxPort } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import {
  DevboxPortBatchUpdateSchema,
  DevboxPortCreateSchema,
  DevboxPortSimpleUpdateSchema,
  DevboxPortUpdateSchema,
  type DevboxPortBatchUpdate,
  type DevboxPortSimpleUpdate,
} from "@/schemas/forms/devbox/components/devbox-port-schema";
import { DevboxResourceSchema } from "@/schemas/forms/devbox/components/devbox-resource-schema";

// Runtime schema for Copilot update parameters (devboxName, optional resource)
export const DevboxUpdateRuntimeSchema = z.object({
  devboxName: z.string().min(1, "Devbox name is required"),
  resource: DevboxResourceSchema.optional(),
});

export type DevboxUpdateRuntime = z.infer<typeof DevboxUpdateRuntimeSchema>;

// Infer create/update shapes for form default consumption
type CreatePort = z.infer<typeof DevboxPortCreateSchema>;
type UpdatePort = z.infer<typeof DevboxPortUpdateSchema>;

// Helper to normalize protocol from existing port data to the union type (HTTP|GRPC|WS)
function normalizeProtocol(
  protocol?: string
): "HTTP" | "GRPC" | "WS" | undefined {
  if (!protocol) return undefined;
  const upper = protocol.toUpperCase();
  if (upper.includes("GRPC")) return "GRPC";
  if (upper.includes("WS")) return "WS";
  if (
    upper.includes("HTTP") ||
    upper.includes("TCP") ||
    upper.includes("INGRESS")
  )
    return "HTTP";
  return undefined;
}

// Convert simple port ops + existing ports into a full list compatible with the update form
export function convertSimplePortOpsToFormPorts(
  existingPorts: ExistingDevboxPort[],
  operations?: DevboxPortSimpleUpdate[]
): Array<CreatePort | UpdatePort> {
  // Build a map of existing ports keyed by number for quick lookup
  const numberToPort = new Map<number, ExistingDevboxPort>();
  for (const p of existingPorts) {
    if (typeof p.number === "number") numberToPort.set(p.number, p);
  }

  const deletes = new Set<number>();
  const updates = new Map<number, DevboxPortSimpleUpdate>();
  const creates: DevboxPortSimpleUpdate[] = [];

  for (const op of operations || []) {
    switch (op.operation) {
      case "delete":
        deletes.add(op.number);
        break;
      case "update":
        updates.set(op.number, op);
        break;
      case "create":
        creates.push(op);
        break;
    }
  }

  const result: Array<CreatePort | UpdatePort> = [];

  // Include all existing ports unless explicitly deleted
  for (const existing of existingPorts) {
    const num = existing.number;
    if (typeof num !== "number") continue;
    if (deletes.has(num)) continue; // skip deleted

    const updateOp = updates.get(num);

    // Derive current exposure/protocol from existing data
    const isPublic = Boolean(
      existing.publicAddress || existing.host || existing.networkName
    );
    const currentProtocol = normalizeProtocol(
      existing.protocol || (isPublic ? "HTTP" : undefined)
    );

    if (updateOp) {
      // Apply update on top of existing
      const exposesPublicDomain = updateOp.exposesPublicDomain ?? isPublic;
      const protocol = updateOp.protocol ?? currentProtocol;
      result.push({
        portName: existing.name || String(num),
        number: num,
        ...(protocol ? { protocol } : {}),
        ...(typeof exposesPublicDomain === "boolean"
          ? { exposesPublicDomain }
          : {}),
      } as UpdatePort);
    } else {
      // Keep as-is (complete list semantics)
      result.push({
        portName: existing.name || String(num),
        number: num,
        ...(currentProtocol ? { protocol: currentProtocol } : {}),
        ...(isPublic ? { exposesPublicDomain: true } : {}),
      } as UpdatePort);
    }
  }

  // Append creates
  for (const c of creates) {
    // Validation already ensures protocol and exposesPublicDomain for create
    result.push({
      number: c.number,
      protocol: c.protocol!,
      exposesPublicDomain: c.exposesPublicDomain!,
    } as CreatePort);
  }

  return result;
}
