"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { DevboxColumn } from "@/components/app/inventory/devbox/devbox-table-schema";
import {
  getDevboxOptions,
  listDevboxOptions,
} from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxListToNameList } from "@/lib/sealos/devbox/devbox-transform";
import { getDevboxAPIContext } from "@/lib/sealos/devbox/devbox-utils";
import { transformDevboxToTableRow } from "./inventory-transform";

export function getDevboxTableData() {
  // Memoize the context to prevent infinite re-renders
  const devboxContext = useMemo(() => getDevboxAPIContext(), []);

  // Fetch the list of devbox names
  const { data: devboxNames, isLoading: listLoading } = useQuery({
    ...listDevboxOptions(devboxContext, transformDevboxListToNameList),
  });

  // Create individual queries for each devbox
  const devboxQueries = useQueries({
    queries: ((devboxNames as string[]) ?? []).map((name: string) => ({
      ...getDevboxOptions(name, devboxContext, transformDevboxToTableRow),
      enabled: !!name,
    })),
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
