"use client";

import { useState } from "react";
import { AddResourceNew } from "./add-resource-new";
import { InventoryTable } from "@/components/app/inventory/inventory-table";
import { useInventories } from "@/hooks/app/inventory/use-inventories";
import { Tabs } from "@/components/ui/vercel-tabs";

const tabs = [
  { id: "new", label: "New" },
  { id: "existing", label: "Existing" },
];

export function AddResourceTabs() {
  const [activeTab, setActiveTab] = useState("new");
  const inventories = useInventories();

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <Tabs
        tabs={tabs}
        onTabChange={setActiveTab}
        className="mb-2 w-full flex-shrink-0"
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "new" && (
          <div className="h-full overflow-y-auto">
            <AddResourceNew />
          </div>
        )}
        {activeTab === "existing" && (
          <div className="h-full overflow-hidden">
            {(() => {
              if (inventories.isLoading) {
                return (
                  <div className="rounded-lg border-2 border-muted border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                      Loading resources...
                    </p>
                  </div>
                );
              }
              if (inventories.isError) {
                return (
                  <div className="rounded-lg border-2 border-destructive border-dashed p-8 text-center">
                    <p className="text-destructive">
                      Failed to load resources:{" "}
                      {inventories.errors.map((e) => e.message).join(", ")}
                    </p>
                  </div>
                );
              }
              return <InventoryTable data={inventories.data} />;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
