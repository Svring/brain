"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listDevboxOptions,
} from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { getDevboxByName } from "@/lib/sealos/devbox/devbox-api/devbox-open-api";
import { runParallelAction } from "next-server-actions-parallel";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import { DataTable } from "@/components/inventory/devbox-inventory/devbox-table";
import { columns } from "@/components/inventory/devbox-inventory/devbox-table-columns";
import type { DevboxInfo } from "@/lib/sealos/devbox/schemas";
import { Loader2 } from "lucide-react";

export function DevboxListCard({ devboxList }: { devboxList: any }) {
  const context = createDevboxContext();

  // Fetch fresh devbox list data
  const { data: listData, isLoading: isListLoading } = useQuery(
    listDevboxOptions(context)
  );

  // Fetch detailed data for each devbox
  const devboxNames = listData?.data?.map((item) => item.name) || [];

  const devboxQueries = useQuery({
    queryKey: ["sealos", "devbox", devboxNames],
    queryFn: async () => {
      if (!devboxNames.length) return [];

      const promises = devboxNames.map((name) =>
        runParallelAction(getDevboxByName(name, context))
      );

      const results = await Promise.allSettled(promises);
      return results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value.data);
    },
    enabled: !!devboxNames.length,
  });

  if (isListLoading || devboxQueries.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading DevBoxes...</span>
      </div>
    );
  }

  if (!devboxQueries.data?.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No DevBoxes found.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-muted">
      <h3 className="text-lg font-semibold mb-4">DevBox List</h3>
      <DataTable<DevboxInfo, any>
        columns={columns}
        data={devboxQueries.data as DevboxInfo[]}
      />
    </div>
  );
}