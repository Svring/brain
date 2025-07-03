"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";
import type { DevboxColumn } from "@/components/app/inventory/devbox/devbox-table-schema";
import { AuthContext } from "@/contexts/auth-context";
import {
  getDevboxOptions,
  listDevboxOptions,
} from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxListToNameList } from "@/lib/sealos/devbox/devbox-transform";
import { DevboxApiContextSchema } from "@/lib/sealos/devbox/schemas";
import { transformDevboxToTableRow } from "./inventory-transform";

export function getDevboxTableData() {
  const { user } = use(AuthContext);

  // Create devbox context from user data
  const devboxContext = useMemo(() => {
    if (!(user?.regionUrl && user?.kubeconfig && user?.devboxToken)) {
      return null;
    }
    return DevboxApiContextSchema.parse({
      baseURL: user.regionUrl,
      authorization: user.kubeconfig,
      authorizationBearer: user.devboxToken,
    });
  }, [user?.regionUrl, user?.kubeconfig, user?.devboxToken]);

  // Fetch the list of devbox names
  const listQueryOptions = devboxContext
    ? listDevboxOptions(devboxContext, transformDevboxListToNameList)
    : {
        queryKey: ["devbox", "list", "disabled"],
        queryFn: () => Promise.resolve({ data: [] }),
      };

  const { data: devboxNames, isLoading: listLoading } = useQuery({
    ...listQueryOptions,
    enabled: !!devboxContext,
  });

  // Create individual queries for each devbox
  const devboxQueries = useQueries({
    queries: ((devboxNames as string[]) ?? []).map((name: string) => {
      const queryOptions = devboxContext
        ? getDevboxOptions(name, devboxContext, transformDevboxToTableRow)
        : {
            queryKey: ["devbox", "get", name, "disabled"],
            queryFn: () => Promise.resolve(null),
          };

      return {
        ...queryOptions,
        enabled: !!name && !!devboxContext,
      };
    }),
  });

  // Transform query results into table rows
  const rows = useMemo(() => {
    return devboxQueries
      .map((query) => query.data)
      .filter((data): data is DevboxColumn => !!data);
  }, [devboxQueries]);

  const isRowsLoading = devboxQueries.some((query) => query.isLoading);
  const isError = devboxQueries.some((query) => query.isError);

  return {
    rows,
    isLoading: listLoading || isRowsLoading,
    isError,
  };
}
