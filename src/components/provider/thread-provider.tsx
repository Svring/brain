"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { searchThreads } from "@/lib/langgraph/langgraph-api/langgraph-api-service";
import {
  useDeleteThreadMutation,
  useUpdateThreadStateMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { Thread } from "@langchain/langgraph-sdk";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface ThreadContextType {
  // Universal thread management methods
  getThreads: (resourceTarget: ResourceTarget | null) => Promise<any[]>;
  createNewThread: any;
  updateThreadState: any;
  deleteThread: any;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuthState();
  const { selectedProject } = useProjectState();
  const { langgraph } = useTRPCClients();

  // Get threads function
  const getThreads = useCallback(
    async (resourceTarget: ResourceTarget | null): Promise<Thread[]> => {
      if (!auth?.kubeconfig) return [];

      try {
        const threads = await searchThreads({
          kubeconfig: auth.kubeconfig,
          projectName: selectedProject,
          resourceTarget: resourceTarget || null,
        });
        return threads;
      } catch (error) {
        console.error("Failed to fetch threads:", error);
        return [];
      }
    },
    [auth?.kubeconfig, selectedProject]
  );

  // Create new thread mutation using TRPC
  const createNewThreadMutation = useMutation(
    langgraph.create.mutationOptions()
  );

  // Update thread state mutation
  const updateThreadStateMutation = useMutation({
    ...useUpdateThreadStateMutation(),
  });

  // Delete thread mutation
  const deleteThreadMutation = useDeleteThreadMutation();

  const value = {
    // Universal thread management methods
    getThreads,
    createNewThread: createNewThreadMutation,
    updateThreadState: updateThreadStateMutation,
    deleteThread: deleteThreadMutation,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
