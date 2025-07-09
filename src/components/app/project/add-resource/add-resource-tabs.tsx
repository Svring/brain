"use client";

import { useState } from "react";
import { InventoryTable } from "@/components/app/inventory/inventory-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventories } from "@/hooks/app/inventory/use-inventories";

export function AddResourceTabs() {
  const [activeTab, setActiveTab] = useState("new");

  const inventories = useInventories();

  return (
    <div className="h-full">
      <Tabs className="h-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid h-full grid-cols-2">
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="existing">Existing</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value="new">
          <div className="space-y-4">
            {/* TODO: Add new resource creation form/content */}
            <div className="rounded-lg border-2 border-muted border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                New resource creation form will go here
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-6 h-full" value="existing">
          <div className="h-full space-y-4">
            {/* Inventory Table Display */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
