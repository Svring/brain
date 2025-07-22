# API Design Guide

## Mutation Hook Architecture Optimization Principles

This guide documents the architectural patterns and optimization principles used in refactoring mutation hooks, particularly for Kubernetes resource management and project operations.

### Core Principles

#### 1. Separation of Concerns

**Principle**: Separate business logic, utility functions, and API interactions into distinct layers.

**Implementation**:
- **Mutation Hooks**: Handle React Query integration, error handling, and UI feedback
- **Utility Functions**: Contain reusable business logic and data transformations
- **API Context**: Manage Kubernetes API connections and configurations

**Example**:
```typescript
// Before: Mixed concerns in mutation hook
export const useAddToProjectMutation = (context: K8sApiContext) => {
  // Complex logic mixed with React Query setup
}

// After: Separated concerns
export const useAddToProjectMutation = () => {
  const context = createK8sContext(); // Utility handles context creation
  // Hook focuses on React Query integration
}
```

#### 2. Context Abstraction

**Principle**: Abstract context creation and management from individual mutation hooks.

**Benefits**:
- Eliminates repetitive context parameter passing
- Centralizes context creation logic
- Simplifies hook APIs
- Enables consistent error handling

**Implementation Pattern**:
```typescript
// Utility function for context creation
export function createK8sContext(): K8sApiContext {
  const { auth } = useAuthState();
  if (!auth) throw new Error("User not found");
  return K8sApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
    namespace: auth.namespace,
  });
}

// Usage in mutation hooks
export const useMutation = () => {
  return useMutation({
    mutationFn: async (params) => {
      const context = createK8sContext(); // Internal context creation
      // ... mutation logic
    }
  });
};
```

#### 3. Utility Function Delegation

**Principle**: Delegate complex business logic to specialized utility functions.

**Categories of Utility Functions**:

##### Resource Management Utilities
- `gatherRelatedResources`: Collect all resources related to a given set
- `convertTargetsToSimplifiedFormat`: Transform resource targets for annotations
- `convertAndFilterResourceToTarget`: Convert K8s resources to target format

##### Annotation Management Utilities
- `parseProjectAnnotation`: Safely parse project annotation JSON
- `mergeProjectAnnotation`: Combine existing and new annotation data
- `removeFromProjectAnnotation`: Remove resources from project annotations

##### Query Invalidation Utilities
- `getProjectQueryInvalidationKeys`: Generate query keys for cache invalidation
- `invalidateQueriesAfterMutation`: Centralized query invalidation (when appropriate)

**Example**:
```typescript
// Before: Complex logic in mutation hook
export const useAddToProjectMutation = () => {
  return useMutation({
    mutationFn: async ({ resources, projectName }) => {
      // 50+ lines of complex resource gathering logic
      // 30+ lines of annotation parsing and merging
      // Multiple API calls with error handling
    }
  });
};

// After: Delegated to utilities
export const useAddToProjectMutation = () => {
  return useMutation({
    mutationFn: async ({ resources, projectName }) => {
      const context = createK8sContext();
      const allTargets = await gatherRelatedResources(context, resources);
      const currentAnnotation = parseProjectAnnotation(annotationValue);
      const updatedAnnotation = mergeProjectAnnotation(currentAnnotation, newResources);
      // Clean, focused mutation logic
    }
  });
};
```

#### 4. Consistent Query Invalidation

**Principle**: Standardize cache invalidation patterns across mutation hooks.

**Implementation**:
```typescript
// Centralized invalidation key generation
export function getProjectQueryInvalidationKeys(namespace: string, projectName?: string) {
  const keys = [
    ["project", "resources", namespace],
    ["project", "get", namespace],
    ["inventory"],
    ["k8s"],
    ["projects"],
  ];
  if (projectName) {
    keys.push(["project", "resources", namespace, projectName]);
  }
  return keys;
}

// Usage in mutation hooks
onSuccess: (_, { projectName }) => {
  const context = createK8sContext();
  const invalidationKeys = getProjectQueryInvalidationKeys(context.namespace, projectName);
  invalidationKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}
```

#### 5. Error Handling Standardization

**Principle**: Implement consistent error handling and user feedback patterns.

**Components**:
- Toast notifications for success/error states
- Proper error propagation
- Graceful fallbacks for parsing operations

**Example**:
```typescript
export function parseProjectAnnotation(annotationValue?: string) {
  if (!annotationValue) {
    return { builtin: [], custom: [] };
  }
  try {
    return JSON.parse(annotationValue);
  } catch (error) {
    console.warn("Failed to parse project annotation, using empty:", error);
    return { builtin: [], custom: [] };
  }
}
```

### Refactoring Workflow

#### Step 1: Identify Patterns
- Locate repetitive context parameter passing
- Find complex business logic embedded in hooks
- Identify inconsistent query invalidation patterns

#### Step 2: Extract Utilities
- Create utility functions for reusable business logic
- Implement context creation abstractions
- Standardize query invalidation helpers

#### Step 3: Refactor Hooks
- Remove context parameters from hook signatures
- Replace inline logic with utility function calls
- Standardize success/error handling patterns

#### Step 4: Update Imports
- Remove unused imports from refactored files
- Add new utility function imports
- Ensure proper dependency management

### Benefits Achieved

1. **Improved Maintainability**: Logic is centralized and reusable
2. **Simplified APIs**: Hooks have cleaner, more intuitive interfaces
3. **Better Testability**: Utility functions can be tested independently
4. **Consistent Architecture**: Uniform patterns across the codebase
5. **Reduced Code Duplication**: Shared utilities eliminate repetition
6. **Enhanced Developer Experience**: Clearer separation of concerns

### Best Practices for Future Development

1. **Always delegate complex logic to utilities** rather than embedding in hooks
2. **Use internal context creation** instead of requiring context parameters
3. **Implement consistent error handling** with proper fallbacks
4. **Standardize query invalidation** using centralized key generation
5. **Maintain clear separation** between React Query concerns and business logic
6. **Document utility functions** with clear parameter types and return values
7. **Test utilities independently** to ensure reliability

This architecture provides a scalable foundation for mutation hooks that can be easily extended and maintained as the application grows.