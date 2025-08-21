"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";

interface ResourceObject {
  name: string;
  kind: string;
  image?: string;
  env?: Array<{
    name: string;
    value?: string;
    valueFrom?: {
      secretKeyRef?: {
        name: string;
        key: string;
      };
    };
  }>;
  ports?: Array<{
    number: number;
    name?: string;
    nodePort?: number;
    protocol?: string;
    serviceName?: string;
    privateAddress?: string;
    publicAddress?: string;
    ingressName?: string;
    host?: string;
  }>;
  [key: string]: any;
}

interface ResourceDataContextValue {
  resourceObjects: ResourceObject[];
  updateResource: (resourceData: ResourceObject) => void;
  removeResource: (name: string, kind: string) => void;
  clearResources: () => void;
  getResource: (name: string, kind: string) => ResourceObject | undefined;
}

const ResourceDataContext = createContext<ResourceDataContextValue | undefined>(undefined);

export const ResourceDataProvider = ({ children }: { children: ReactNode }) => {
  const [resourceObjects, setResourceObjects] = useState<ResourceObject[]>([]);

  const updateResource = useCallback((resourceData: ResourceObject) => {
    setResourceObjects(prev => {
      const existingIndex = prev.findIndex(
        resource => resource.name === resourceData.name && resource.kind === resourceData.kind
      );

      if (existingIndex >= 0) {
        // Check if the resource actually changed before updating
        const existing = prev[existingIndex];
        if (JSON.stringify(existing) === JSON.stringify(resourceData)) {
          return prev; // No change, return the same array to prevent re-render
        }
        
        // Update existing resource
        const updated = [...prev];
        updated[existingIndex] = resourceData;
        return updated;
      } else {
        // Add new resource
        return [...prev, resourceData];
      }
    });
  }, []);

  const removeResource = useCallback((name: string, kind: string) => {
    setResourceObjects(prev => 
      prev.filter(resource => !(resource.name === name && resource.kind === kind))
    );
  }, []);

  const clearResources = useCallback(() => {
    setResourceObjects([]);
  }, []);

  const getResource = useCallback((name: string, kind: string): ResourceObject | undefined => {
    return resourceObjects.find(
      resource => resource.name === name && resource.kind === kind
    );
  }, [resourceObjects]);

  const contextValue = useMemo(() => ({
    resourceObjects, 
    updateResource, 
    removeResource, 
    clearResources, 
    getResource 
  }), [resourceObjects, updateResource, removeResource, clearResources, getResource]);

  return (
    <ResourceDataContext.Provider value={contextValue}>
      {children}
    </ResourceDataContext.Provider>
  );
};

export function useResourceData() {
  const ctx = useContext(ResourceDataContext);
  if (!ctx) {
    throw new Error("useResourceData must be used within ResourceDataProvider");
  }
  return ctx;
}
