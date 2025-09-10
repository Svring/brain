import { useQueryClient } from "@tanstack/react-query";

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = (queryKeys: any[]) => {
    console.log("Invalidating queries:", queryKeys);
    queryKeys.forEach((queryKey) => {
      const key = typeof queryKey === "function" ? queryKey() : queryKey;
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  return { invalidateQueries };
};
