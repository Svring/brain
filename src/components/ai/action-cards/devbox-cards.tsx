"use client";

import type {
  DevboxListItem,
  DevboxListResponse,
} from "@/lib/sealos/devbox/schemas";

export function DevboxListCard({
  devboxList: { data },
}: {
  devboxList: DevboxListResponse;
}) {
  if (!data?.length) {
    return <div>No DevBoxes found.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">DevBox List</h2>
      <ul>
        {data.map((devbox: DevboxListItem) => (
          <li key={devbox.id} className="border-b last:border-b-0 py-2">
            <p className="font-semibold">{devbox.name}</p>
            <p className="text-sm text-gray-500">ID: {devbox.id}</p>
            <p className="text-sm text-gray-500">
              Created: {new Date(devbox.createTime).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
