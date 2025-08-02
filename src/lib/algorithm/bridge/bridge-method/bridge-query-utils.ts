"use client";

import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { flattenResourcesResult } from "@/lib/algorithm/relevance/relevance-utils";
import { getResource, listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import {
  ObjectQuery,
  ObjectQuerySchema,
} from "../bridge-schemas/bridge-query-schema";
import { getSchemaForResourceType } from "../bridge-constant";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
  BuiltinResourceTarget,
  BuiltinResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import _ from "lodash";
import { z } from "zod";

// ============================================================================
// CORE UTILITY FUNCTIONS
// ============================================================================

/**
 * Parses a JSON string description from a schema field
 * @param description - The JSON string description
 * @returns Parsed FieldDescription object
 */
export function parseFieldDescription(description: string): ObjectQuery {
  return ObjectQuerySchema.parse(JSON.parse(description));
}

/**
 * Extracts data from any object based on the specified path
 * @param data - The object to extract data from
 * @param path - The path to extract data from (array of strings)
 * @returns The extracted data or null if path doesn't exist
 */
export function extractDataFromObject(data: any, path: string[]): any {
  if (!data || !path?.length) return null;
  if (path.length === 1) {
    // Handle empty string path to return the object directly
    if (path[0] === "") return data;
    return _.get(data, path[0], null);
  }

  return _.chain(path)
    .reduce((current, segment, i) => {
      if (current === null) return null;
      const isLastSegment = i === path.length - 1;

      if (Array.isArray(current)) {
        return isLastSegment
          ? _.filter(
              _.map(current, (item) => _.get(item, segment, null)),
              (item) => item !== null
            )
          : _.flatMap(
              _.filter(
                _.map(current, (item) => _.get(item, segment, null)),
                (item) => item !== null
              )
            );
      }

      current = _.get(current, segment, null);
      return current === null
        ? null
        : Array.isArray(current)
        ? current
        : [current];
    }, data)
    .thru((result) =>
      Array.isArray(result) && result.length
        ? _.filter(result, (item) => item !== null)
        : null
    )
    .value();
}

// ============================================================================
// SCHEMA PROCESSING FUNCTIONS
// ============================================================================

/**
 * Parses a Zod schema and extracts description options for all fields
 * @param schema - The Zod schema to parse
 * @returns Nested object structure preserving the original schema hierarchy
 */
export function parseFieldDescriptions(schema: z.ZodObject<any>): any {
  return _.chain(schema)
    .thru((s) => (s instanceof z.ZodObject ? s.shape : {}))
    .entries()
    .reduce((result, [key, zodValue]) => {
      const description = _.attempt(
        () =>
          _.get(zodValue, "_def.description") &&
          parseFieldDescription(zodValue._def.description)
      );

      const nestedResult =
        zodValue instanceof z.ZodObject
          ? parseFieldDescriptions(zodValue)
          : zodValue instanceof z.ZodArray &&
            zodValue._def?.type instanceof z.ZodObject
          ? {
              _isArray: true,
              ...parseFieldDescriptions(zodValue._def.type),
            }
          : {};

      return {
        ...result,
        [key]: {
          ...(_.isError(description) ? {} : description),
          ...(_.isEmpty(nestedResult) ? {} : nestedResult),
        },
      };
    }, {})
    .value();
}

/**
 * Flattens nested schema descriptions to get only leaf nodes with resourceType
 * @param schemaDescriptions - Nested schema descriptions object
 * @param prefix - Current path prefix for nested keys
 * @returns Flattened record of field paths to schema descriptions
 */
function flattenFieldDescriptions(
  schemaDescriptions: any,
  prefix: string = ""
): Record<string, ObjectQuery> {
  return _.chain(schemaDescriptions)
    .entries()
    .reduce((result, [key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      return _.isObject(value) && !_.isArray(value)
        ? _.has(value, "resourceType")
          ? { ...result, [fullKey]: value }
          : { ...result, ...flattenFieldDescriptions(value, fullKey) }
        : result;
    }, {})
    .value();
}

// ============================================================================
// RESOURCE FETCHING FUNCTIONS
// ============================================================================

/**
 * Processes a single field value from parseFieldDescriptions to get the corresponding resource
 * @param context - K8s API context
 * @param fieldValue - The field value containing resourceType and optional label/name
 * @param instanceName - Name of the instance (used when no label is specified)
 * @returns Promise resolving to the fetched resource(s)
 */
async function getResourceByFieldValue(
  context: K8sApiContext,
  fieldValue: ObjectQuery,
  instanceName: string
) {
  if (fieldValue.resourceType === "external") {
    return null;
  }

  const baseTarget = convertResourceTypeToTarget(fieldValue.resourceType);

  if (fieldValue.label) {
    // Construct the complete label selector by combining label key with instance name
    const labelSelector = `${fieldValue.label}=${instanceName}`;

    const labelSearchResult = await listAllResources(
      context,
      labelSelector,
      baseTarget.type === "builtin" ? [fieldValue.resourceType] : undefined,
      baseTarget.type === "custom" ? [fieldValue.resourceType] : undefined
    );

    const flattenedResources = flattenResourcesResult(labelSearchResult);

    const filteredResources = fieldValue.name
      ? flattenedResources.filter((resource) => {
          if (!fieldValue.name) return false;
          // Replace {{instanceName}} placeholder with actual instance name
          const namePattern = fieldValue.name.replace(
            /\{\{instanceName\}\}/g,
            instanceName
          );
          // Use regex matching for the pattern
          return new RegExp(namePattern).test(resource.metadata.name || "");
        })
      : flattenedResources;

    // If no path is specified, return the list of resources
    if (
      !fieldValue.path ||
      (Array.isArray(fieldValue.path) && fieldValue.path.length === 0) ||
      (Array.isArray(fieldValue.path) &&
        fieldValue.path.length === 1 &&
        fieldValue.path[0] === "")
    ) {
      return filteredResources;
    }

    if (filteredResources.length > 1) {
      throw new Error(
        `Multiple resources ${
          fieldValue.name
            ? `matched the pattern ${fieldValue.name}`
            : `found for label ${fieldValue.label}`
        }. Only one resource is allowed.`
      );
    }

    return filteredResources[0] || null;
  }

  // If no label is present but a name pattern is specified, list all resources and filter by name regex
  if (fieldValue.name) {
    const allResourcesResult = await listAllResources(
      context,
      undefined, // No label selector - list all resources
      baseTarget.type === "builtin" ? [fieldValue.resourceType] : undefined,
      baseTarget.type === "custom" ? [fieldValue.resourceType] : undefined
    );

    const flattenedResources = flattenResourcesResult(allResourcesResult);

    const filteredResources = flattenedResources.filter((resource) => {
      // Replace {{instanceName}} placeholder with actual instance name
      const namePattern = fieldValue.name!.replace(
        /\{\{instanceName\}\}/g,
        instanceName
      );
      // Use regex matching for the pattern
      return new RegExp(namePattern).test(resource.metadata.name || "");
    });

    // If no path is specified, return the list of resources
    if (
      !fieldValue.path ||
      (Array.isArray(fieldValue.path) && fieldValue.path.length === 0) ||
      (Array.isArray(fieldValue.path) &&
        fieldValue.path.length === 1 &&
        fieldValue.path[0] === "")
    ) {
      return filteredResources;
    }

    if (filteredResources.length > 1) {
      throw new Error(
        `Multiple resources matched the pattern ${fieldValue.name}. Only one resource is allowed.`
      );
    }

    return filteredResources[0] || null;
  }

  // Fall back to exact name match
  const target = { ...baseTarget, name: instanceName };

  try {
    return await getResource(context, target);
  } catch (error) {
    return null;
  }
}

/**
 * Creates a unique cache key for a resource locator
 * @param fieldValue - The field value containing resourceType and optional label/name
 * @param instanceName - Name of the instance
 * @returns A unique string key for caching
 */
function createResourceLocatorKey(
  fieldValue: ObjectQuery,
  instanceName: string
): string {
  if (fieldValue.resourceType === "external") {
    return `external:${fieldValue.resourceType}`;
  }

  const parts = [fieldValue.resourceType];

  if (fieldValue.label) {
    parts.push(`label:${fieldValue.label}=${instanceName}`);
  }

  if (fieldValue.name) {
    const namePattern = fieldValue.name.replace(
      /\{\{instanceName\}\}/g,
      instanceName
    );
    parts.push(`name:${namePattern}`);
  } else if (!fieldValue.label) {
    // Fall back to exact name match
    parts.push(`exact:${instanceName}`);
  }

  return parts.join("|");
}

/**
 * Fetches resources for multiple schema descriptions with caching to avoid redundant API calls
 * @param context - K8s API context
 * @param schemaDescriptions - Record of field names to schema descriptions (can be nested)
 * @param instanceName - Name of the instance
 * @returns Promise resolving to a record of field names to their corresponding resources
 */
export async function getResourcesByFieldDescriptions(
  context: K8sApiContext,
  schemaDescriptions: Record<string, any>,
  instanceName: string
): Promise<Record<string, any>> {
  const flattenedDescriptions = flattenFieldDescriptions(schemaDescriptions);
  const entries = Object.entries(flattenedDescriptions);

  // Cache to store fetched resources by their locator key
  const resourceCache = new Map<string, any>();

  // Group fields by their resource locator to identify duplicates
  const fieldsByLocator = new Map<string, string[]>();

  for (const [fieldName, description] of entries) {
    const locatorKey = createResourceLocatorKey(description, instanceName);
    if (!fieldsByLocator.has(locatorKey)) {
      fieldsByLocator.set(locatorKey, []);
    }
    fieldsByLocator.get(locatorKey)!.push(fieldName);
  }

  // Fetch resources only once per unique locator
  const uniqueLocators = Array.from(fieldsByLocator.keys());
  const fetchPromises = uniqueLocators.map(async (locatorKey) => {
    // Get the first field with this locator to extract the description
    const firstFieldName = fieldsByLocator.get(locatorKey)![0];
    const description = flattenedDescriptions[firstFieldName];

    const resource = await getResourceByFieldValue(
      context,
      description,
      instanceName
    );

    resourceCache.set(locatorKey, resource);
    return [locatorKey, resource] as const;
  });

  await Promise.all(fetchPromises);

  // Map each field to its corresponding cached resource
  const results: Record<string, any> = {};
  for (const [fieldName, description] of entries) {
    const locatorKey = createResourceLocatorKey(description, instanceName);
    results[fieldName] = resourceCache.get(locatorKey);
  }

  return results;
}

// ============================================================================
// DATA EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Sets a nested value in an object using a dot-separated path
 * @param obj - Target object
 * @param path - Dot-separated path (e.g., "resources.cpu")
 * @param value - Value to set
 */
function setNestedValue(obj: any, path: string, value: any): void {
  _.chain(path.split("."))
    .reduce((current, key, i, keys) => {
      if (i === keys.length - 1) {
        current[key] = value;
        return current;
      }
      return (current[key] =
        _.isObject(current[key]) && current[key] !== null ? current[key] : {});
    }, obj)
    .value();
}

/**
 * Categorizes resource entries into array groups and regular fields
 * @param resourceEntries - Array of [fieldName, resource] pairs
 * @param flattenedDescriptions - Flattened schema descriptions
 * @returns Object containing categorized array groups and regular fields
 */
function categorizeResourceEntries(
  resourceEntries: [string, any][],
  flattenedDescriptions: Record<string, ObjectQuery>
) {
  const arrayGroups: Record<
    string,
    { fieldName: string; description: any; resource: any }[]
  > = {};
  const regularFields: {
    fieldName: string;
    description: any;
    resource: any;
  }[] = [];

  for (const [fieldName, resource] of resourceEntries) {
    const description = flattenedDescriptions[fieldName];

    if (
      description &&
      description.path &&
      Array.isArray(description.path) &&
      description.path.length >= 2
    ) {
      const arrayBasePath = description.path.slice(0, -1).join(".");
      const arrayKey = `${fieldName
        .split(".")
        .slice(0, -1)
        .join(".")}_${arrayBasePath}`;

      if (!arrayGroups[arrayKey]) {
        arrayGroups[arrayKey] = [];
      }
      arrayGroups[arrayKey].push({ fieldName, description, resource });
    } else {
      regularFields.push({ fieldName, description, resource });
    }
  }

  return { arrayGroups, regularFields };
}

/**
 * Processes regular fields and sets their values in the results object
 * @param regularFields - Array of regular field objects
 * @param results - Results object to modify
 */
function processRegularFields(
  regularFields: { fieldName: string; description: any; resource: any }[],
  results: Record<string, any>
): void {
  for (const { fieldName, description, resource } of regularFields) {
    let extractedValue;

    // If no path is specified or path is empty/[""], return the resource as-is (list of resources)
    if (
      !description?.path ||
      (Array.isArray(description.path) && description.path.length === 0) ||
      (Array.isArray(description.path) &&
        description.path.length === 1 &&
        description.path[0] === "")
    ) {
      extractedValue = resource;
    } else {
      extractedValue = extractDataFromObject(resource, description.path);
    }

    setNestedValue(results, fieldName, extractedValue);
  }
}

/**
 * Processes array groups to combine multiple properties into arrays of objects
 * @param arrayGroups - Grouped array fields
 * @param results - Results object to modify
 */
function processArrayGroups(
  arrayGroups: Record<
    string,
    { fieldName: string; description: any; resource: any }[]
  >,
  results: Record<string, any>
): void {
  _.forEach(arrayGroups, (fields, arrayKey) => {
    if (_.isEmpty(fields)) return;

    const firstField = _.head(fields);
    if (!firstField || !_.get(firstField, "description.path")) return;

    const arrayBasePath = firstField.description.path.slice(0, -1);
    const arrayData = extractDataFromObject(firstField.resource, arrayBasePath);

    if (_.isArray(arrayData)) {
      const combinedArray = _.map(arrayData, (item) =>
        _.reduce(
          fields,
          (combinedItem, { fieldName, description }) => {
            const propertyName: string | null | undefined = _.get(
              description,
              "path"
            )
              ? _.last(description.path)
              : null;
            if (!propertyName) return combinedItem;
            const fieldKey = _.last(fieldName.split(".")) || fieldName;
            return {
              ...combinedItem,
              [fieldKey]: item[propertyName as string],
            };
          },
          {}
        )
      );

      const parentFieldName = firstField.fieldName
        .split(".")
        .slice(0, -1)
        .join(".");
      if (parentFieldName) _.set(results, parentFieldName, combinedArray);
    }
  });
}

/**
 * Processes array fields that are marked with _isArray flag
 * @param resourceEntries - Array of [fieldName, resource] pairs
 * @param schemaDescriptions - Original nested schema descriptions
 * @param results - Results object to modify
 */
function processArrayFields(
  resourceEntries: [string, any][],
  schemaDescriptions: Record<string, any>,
  results: Record<string, any>
): void {
  // Find array fields in the schema
  _.forEach(schemaDescriptions, (fieldSchema, fieldName) => {
    if (fieldSchema._isArray) {
      // Get the resource for this field (should be the same for all sub-fields)
      const resourceEntry = resourceEntries.find(([name]) =>
        name.startsWith(fieldName)
      );
      if (!resourceEntry) return;

      const [, resource] = resourceEntry;
      if (!resource) return;

      // Extract the array data from the first path segment
      const subFields = _.omit(fieldSchema, ["_isArray"]);
      const firstSubField = _.head(_.values(subFields));

      if (
        firstSubField &&
        firstSubField.path &&
        firstSubField.path.length >= 2
      ) {
        const arrayBasePath = firstSubField.path.slice(0, -1);
        const arrayData = extractDataFromObject(resource, arrayBasePath);

        if (_.isArray(arrayData)) {
          const combinedArray = _.map(arrayData, (item) => {
            const combinedItem: Record<string, any> = {};

            _.forEach(subFields, (subFieldSchema, subFieldName) => {
              if (subFieldSchema._isArray) {
                // Handle nested arrays
                const nestedSubFields = _.omit(subFieldSchema, ["_isArray"]);
                const nestedFirstSubField = _.head(_.values(nestedSubFields));

                if (
                  nestedFirstSubField &&
                  nestedFirstSubField.path &&
                  nestedFirstSubField.path.length >= 2
                ) {
                  const nestedArrayBasePath = nestedFirstSubField.path.slice(
                    0,
                    -1
                  );
                  const nestedArrayData = extractDataFromObject(
                    item,
                    nestedArrayBasePath
                  );

                  if (_.isArray(nestedArrayData)) {
                    const nestedCombinedArray = _.map(
                      nestedArrayData,
                      (nestedItem) => {
                        const nestedCombinedItem: Record<string, any> = {};

                        _.forEach(
                          nestedSubFields,
                          (nestedSubFieldSchema, nestedSubFieldName) => {
                            if (nestedSubFieldSchema.path) {
                              const nestedPropertyName = _.last(
                                nestedSubFieldSchema.path
                              );
                              if (
                                nestedPropertyName &&
                                typeof nestedPropertyName === "string"
                              ) {
                                nestedCombinedItem[nestedSubFieldName] = _.get(
                                  nestedItem,
                                  nestedPropertyName,
                                  null
                                );
                              }
                            }
                          }
                        );

                        return nestedCombinedItem;
                      }
                    );

                    combinedItem[subFieldName] = nestedCombinedArray;
                  }
                }
              } else if (subFieldSchema.path) {
                const propertyName = _.last(subFieldSchema.path);
                if (propertyName && typeof propertyName === "string") {
                  combinedItem[subFieldName] = _.get(item, propertyName, null);
                }
              } else {
                // Handle nested objects that are not arrays
                const nestedObject: Record<string, any> = {};
                _.forEach(
                  subFieldSchema,
                  (nestedFieldSchema, nestedFieldName) => {
                    if (nestedFieldSchema.path) {
                      const nestedPropertyName = _.last(nestedFieldSchema.path);
                      if (
                        nestedPropertyName &&
                        typeof nestedPropertyName === "string"
                      ) {
                        nestedObject[nestedFieldName] = _.get(
                          item,
                          nestedPropertyName,
                          null
                        );
                      }
                    }
                  }
                );
                if (!_.isEmpty(nestedObject)) {
                  combinedItem[subFieldName] = nestedObject;
                }
              }
            });

            return combinedItem;
          });

          results[fieldName] = combinedArray;
        }
      }
    }
  });
}

/**
 * Transforms [fieldName, resource] pairs to extract desired data using schema descriptions
 * @param resourceEntries - Array of [fieldName, resource] pairs (with flattened field names)
 * @param schemaDescriptions - Original nested schema descriptions containing path information
 * @returns Record with nested structure reconstructed from flattened field names
 */
export function extractDataFromResources(
  resourceEntries: [string, any][],
  schemaDescriptions: Record<string, any>
): Record<string, any> {
  const results: Record<string, any> = {};
  const flattenedDescriptions = flattenFieldDescriptions(schemaDescriptions);

  const { arrayGroups, regularFields } = categorizeResourceEntries(
    resourceEntries,
    flattenedDescriptions
  );

  processRegularFields(regularFields, results);
  processArrayGroups(arrayGroups, results);
  processArrayFields(resourceEntries, schemaDescriptions, results);

  return results;
}

// ============================================================================
// MAIN COMPOSITION FUNCTION
// ============================================================================

/**
 * Composes an object from a target by determining the appropriate schema and parsing its descriptions
 * @param context - K8s API context
 * @param target - The resource target (custom or builtin)
 * @returns Promise resolving to the composed object conforming to the target's schema
 */
export async function composeObjectFromTarget(
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
): Promise<any> {
  const parsedTarget = _.find(
    [CustomResourceTargetSchema, BuiltinResourceTargetSchema],
    (schema) => schema.safeParse(target).success
  )?.safeParse(target).data!;

  const schema = getSchemaForResourceType(parsedTarget.resourceType);
  if (!schema) {
    throw new Error(
      `No schema found for resource type: ${parsedTarget.resourceType}`
    );
  }

  if (!parsedTarget.name) {
    throw new Error(
      `Instance name is required in target: ${JSON.stringify(parsedTarget)}`
    );
  }

  const schemaDescriptions = parseFieldDescriptions(schema);

  const resources = await getResourcesByFieldDescriptions(
    context,
    schemaDescriptions,
    parsedTarget.name
  );

  const resourceEntries = Object.entries(resources);

  const extractedData = extractDataFromResources(
    resourceEntries,
    schemaDescriptions
  );

  // Apply Zod schema parsing to handle transforms and validation
  try {
    const parsedData = schema.parse(extractedData);
    return parsedData;
  } catch (error) {
    console.warn("Schema parsing failed, returning raw extracted data:", error);
    return extractedData;
  }
}
