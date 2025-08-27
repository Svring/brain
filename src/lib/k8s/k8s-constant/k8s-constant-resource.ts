/**
 * Unified resource options constants for all Kubernetes resources
 * These define the available CPU and memory options that are shared across all resource types
 */

// Unified CPU options (in cores for launchpad, millicores for others)
export const CPU_OPTIONS = [0.1, 0.5, 1, 2, 4, 8] as const;

// Unified memory options (in GB for launchpad, MB for others)
export const MEMORY_OPTIONS = [0.5, 1, 2, 4, 8, 16] as const;

// Unified replicas options
export const REPLICAS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// Storage options for resources that support it (in GB)
export const STORAGE_OPTIONS = [1, 3, 5, 10, 20, 50, 100, 200, 300] as const;

// Type exports for TypeScript
export type CpuOption = (typeof CPU_OPTIONS)[number];
export type MemoryOption = (typeof MEMORY_OPTIONS)[number];
export type ReplicasOption = (typeof REPLICAS_OPTIONS)[number];
export type StorageOption = (typeof STORAGE_OPTIONS)[number];
