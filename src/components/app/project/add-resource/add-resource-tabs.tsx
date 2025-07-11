"use client";

import { useState } from "react";
import { AddResourceNew } from "./add-resource-new";
import { AddResourceExisted } from "./add-resource-existed";
import { Tabs } from "@/components/ui/vercel-tabs";

const tabs = [
  { id: "new", label: "New" },
  { id: "existing", label: "Existing" },
];

export function AddResourceTabs() {
  const [activeTab, setActiveTab] = useState("new");

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
            <AddResourceExisted />
          </div>
        )}
      </div>
    </div>
  );
}
