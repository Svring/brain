import type { DevboxColumn } from "@/components/app/inventory/devbox/devbox-table-schema";
import type { DevboxGetResponse } from "@/lib/sealos/devbox/schemas";

/**
 * Transform a single DevboxGetResponse into a table row.
 */
export const transformDevboxToTableRow = (
  data: DevboxGetResponse
): DevboxColumn => {
  const info = data.data;
  return {
    name: info.name,
    template: info.imageName,
    status: info.status,
    createdAt: new Date(info.createTime).toLocaleDateString(),
    cost: "$0.00",
    project: "",
  };
};
