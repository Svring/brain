import { z } from "zod";
import {
  ObjectMutation,
  ObjectMutationSchema,
} from "@/lib/algorithm/bridge/bridge-schemas/bridge-mutation-schema";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
  ResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  usePatchResourceMutation,
  useApplyResourceMutation,
  useDeleteResourceMutation,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import { Operation } from "fast-json-patch";

/**
 * Parses field descriptions from a Zod schema
 * @param schema - A Zod schema that may contain describe() calls
 * @returns Object with field names as keys and parsed descriptions as values
 */
export function parseSchemaDescriptions(
  schema: z.ZodTypeAny
): Record<string, ObjectMutation> {
  const result: Record<string, ObjectMutation> = {};

  function traverseSchema(
    currentSchema: z.ZodTypeAny,
    fieldPath: string[] = []
  ): void {
    const description = currentSchema.description;
    if (description && fieldPath.length > 0) {
      const fieldName = fieldPath.join(".");
      try {
        result[fieldName] = ObjectMutationSchema.parse(JSON.parse(description));
      } catch (e) {
        console.error(`Failed to parse description for field ${fieldName}:`, e);
      }
    }

    if (currentSchema instanceof z.ZodObject) {
      const shape = currentSchema.shape;
      for (const [key, value] of Object.entries(shape)) {
        traverseSchema(value as z.ZodTypeAny, [...fieldPath, key]);
      }
    } else if (currentSchema instanceof z.ZodOptional) {
      traverseSchema(currentSchema._def.innerType, fieldPath);
    }
  }

  traverseSchema(schema);
  return result;
}

/**
 * Substitutes template variables in mutation operations with actual data values
 * @param descriptions - Parsed schema descriptions from parseSchemaDescriptions
 * @param data - Data object conforming to the schema
 * @returns Array of mutation operations with substituted values
 */
export function substituteMutationTemplates(
  descriptions: Record<string, any>,
  data: Record<string, any>
): any[] {
  const mutations: any[] = [];

  // Helper function to get nested value from object using dot notation
  function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Helper function to check if substitution was successful
  function hasFailedSubstitution(value: any): boolean {
    if (typeof value === "string") {
      return /\{\{[^}]+\}\}/.test(value);
    } else if (Array.isArray(value)) {
      return value.some((item) => hasFailedSubstitution(item));
    } else if (value && typeof value === "object") {
      return Object.values(value).some((val) => hasFailedSubstitution(val));
    }
    return false;
  }

  // Helper function to substitute {{}} templates in any value
  function substituteTemplates(value: any): any {
    if (typeof value === "string") {
      // Check if the entire string is a template (e.g., "{{path}}")
      const fullTemplateMatch = value.match(/^\{\{([^}]+)\}\}$/);
      if (fullTemplateMatch) {
        const path = fullTemplateMatch[1].trim();
        const actualValue = getNestedValue(data, path);
        return actualValue !== undefined ? actualValue : value;
      }

      // Replace {{path}} with actual values from data for partial templates
      return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const actualValue = getNestedValue(data, path.trim());
        return actualValue !== undefined ? actualValue : match;
      });
    } else if (Array.isArray(value)) {
      return value.map((item) => substituteTemplates(item));
    } else if (value && typeof value === "object") {
      const result: any = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = substituteTemplates(val);
      }
      return result;
    }
    return value;
  }

  // Process each field's mutation operations
  for (const [fieldName, operations] of Object.entries(descriptions)) {
    if (Array.isArray(operations)) {
      // Check if the field exists in data before processing
      const fieldValue = getNestedValue(data, fieldName);
      if (fieldValue !== undefined) {
        const substitutedOps = operations
          .map((op) => substituteTemplates(op))
          .filter((op) => !hasFailedSubstitution(op)); // Remove operations with failed substitutions
        mutations.push(...substitutedOps);
      }
    }
  }

  return mutations;
}

/**
 * Converts mutation operations to include proper resource targets
 * @param target - The original target containing name information
 * @param mutations - Array of mutation operations from substituteMutationTemplates
 * @returns Array of mutation operations with proper resource targets
 */
export function convertMutationsToTargets(
  target: ResourceTarget,
  mutations: any[]
): any[] {
  return mutations.map((mutation) => {
    // Skip if mutation doesn't have resourceKind
    if (!mutation.resourceKind) {
      return mutation;
    }

    try {
      // Convert resourceKind to proper target using convertResourceTypeToTarget
      const resourceTarget = convertResourceTypeToTarget(mutation.resourceKind);

      // Add name from the original target if it exists
      const targetWithName = {
        ...resourceTarget,
        name: target.name || mutation.name,
      };

      // Return mutation with the constructed target, removing resourceKind
      const { resourceKind, ...mutationWithoutResourceKind } = mutation;
      return {
        ...mutationWithoutResourceKind,
        target: targetWithName,
      };
    } catch (error) {
      console.warn(
        `Failed to convert resourceKind '${mutation.resourceKind}' to target:`,
        error
      );
      return mutation;
    }
  });
}

/**
 * Executes mutation operations sequentially using appropriate k8s mutation hooks
 * @param context - K8s API context
 * @param operations - Array of mutation operations
 * @returns Promise that resolves when all operations are completed
 */
export async function executeMutationOperations(
  context: K8sApiContext,
  operations: any[]
): Promise<void> {
  const patchMutation = usePatchResourceMutation(context);
  const applyMutation = useApplyResourceMutation(context);
  const deleteMutation = useDeleteResourceMutation(context);

  for (const operation of operations) {
    try {
      if (operation.patch && operation.target) {
        // Handle patch operation
        const patchOps: Operation[] = [operation.patch];
        await patchMutation.mutateAsync({
          target: operation.target,
          patchBody: patchOps,
        });
      } else if (operation.upsert) {
        // Handle upsert operation
        if (operation.upsert.resource) {
          for (const resource of operation.upsert.resource) {
            if (resource && resource.trim() !== "") {
              await applyMutation.mutateAsync({
                resourceContent: resource,
              });
            }
          }
        }
      } else if (operation.delete && operation.delete.target) {
        // Handle delete operation
        await deleteMutation.mutateAsync({
          target: operation.delete.target,
        });
      }
    } catch (error) {
      console.error(`Failed to execute mutation operation:`, error);
      throw error;
    }
  }
}
