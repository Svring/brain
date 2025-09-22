"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { searchThreads } from "@/lib/langgraph/langgraph-api/langgraph-api-service";
import { useDeleteThreadMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
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
  patchThread: any;
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

  // Update thread state mutation using TRPC
  const updateThreadStateMutation = useMutation(
    langgraph.updateState.mutationOptions()
  );

  // Delete thread mutation
  const deleteThreadMutation = useDeleteThreadMutation();

  // Patch thread mutation using TRPC
  const patchThreadMutation = useMutation(langgraph.patch.mutationOptions());

  const value = {
    // Universal thread management methods
    getThreads,
    createNewThread: createNewThreadMutation,
    updateThreadState: updateThreadStateMutation,
    deleteThread: deleteThreadMutation,
    patchThread: patchThreadMutation,
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
