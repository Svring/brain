import { useQueryClient } from "@tanstack/react-query";

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = (queryKeys: any[]) => {
    console.log("Invalidating queries:", queryKeys);
    setTimeout(() => {
      queryKeys.forEach((queryKey) => {
        const key = typeof queryKey === "function" ? queryKey() : queryKey;
        queryClient.invalidateQueries({ queryKey: key });
      });
    }, 1000);
  };

  return { invalidateQueries };
};
