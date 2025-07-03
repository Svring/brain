"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { DevboxColumn } from "@/components/app/inventory/devbox/devbox-table-schema";
import { getDevboxAPIContext } from "@/lib/sealos/devbox/devbox-utils";
import { getDevboxOptions } from "./devbox-query";
import type { DevboxGetResponse, DevboxListResponse } from "./schemas";

/**
 * Transform a single DevboxGetResponse into a table row.
 */
export const transformDevboxInfoToTableRow = (
  data: DevboxGetResponse
): DevboxColumn => {
  const info = data.data;
  return {
    name: info.name,
    template: info.imageName,
    status: info.status,
    createdAt: new Date(info.createTime).toLocaleDateString(),
    cost: "$0.00", // TODO: replace with real cost calculation
    project: "",
  };
};

/**
 * Hook that, given a DevboxListResponse, fetches each devbox's full info and
 * returns an array of table rows plus loading & error states.
 */
export const transformDevboxListToTableRows = (
  listData: DevboxListResponse | undefined
) => {
  const context = getDevboxAPIContext();

  // Memoize devboxNames to ensure stability
  const devboxNames = useMemo(
    () => listData?.data?.map((item) => item.name) ?? [],
    [listData]
  );

  // Create queries for each devbox name
  const devboxTableQueries = useQueries({
    queries: devboxNames.map((name) => ({
      ...getDevboxOptions(name, context, transformDevboxInfoToTableRow),
      enabled: !!name, // Only run query if name exists
    })),
  });

  // Transform query results into rows
  const rows = useMemo(
    () =>
      devboxTableQueries
        .map((query) => query.data)
        .filter((data): data is DevboxColumn => !!data), // Filter out undefined/null results
    [devboxTableQueries]
  );

  return {
    rows,
    isLoading: devboxTableQueries.some((q) => q.isLoading),
    isError: devboxTableQueries.some((q) => q.isError),
  };
};

/**
 * Transform a DevboxListResponse into an array of devbox names (string[]).
 */
export const transformDevboxListToNameList = (
  listData: DevboxListResponse | undefined
): string[] => {
  return listData?.data?.map((item) => item.name) ?? [];
};
