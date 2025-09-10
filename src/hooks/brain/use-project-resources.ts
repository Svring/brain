import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export default function useProjectResources(projectName: string) {
  const { project } = useTRPCClients();

  const {
    data: result,
    isLoading,
    error,
  } = useQuery({
    ...project.getResources.queryOptions(projectName),
  });

  return {
    targets: result?.targets || [],
    resources: result?.resources || [],
    isLoading,
    error,
  };
}
