"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { SpotlightCard } from "@/components/app/base/spotlight-card";
import { DevboxTable } from "@/components/app/inventory/devbox/devbox-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActiveTab = "project" | "inventory";

export default function Page() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("project");

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-8">
      {/* Header */}
      <div className="mb-8 flex w-4xl">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "rounded-md px-3 py-1 font-semibold text-lg transition-colors",
                activeTab === "project"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab("project")}
              type="button"
            >
              Project
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              className={cn(
                "rounded-md px-3 py-1 font-semibold text-lg transition-colors",
                activeTab === "inventory"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab("inventory")}
              type="button"
            >
              Inventory
            </button>
          </div>
          <Button
            aria-label="Add New"
            className="inline-flex items-center justify-center text-foreground transition-colors focus:outline-none"
            variant="ghost"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        {activeTab === "project" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            <SpotlightCard key="card-1">Card 1</SpotlightCard>
            <SpotlightCard key="card-2">Card 2</SpotlightCard>
            <SpotlightCard key="card-3">Card 3</SpotlightCard>
            <SpotlightCard key="card-4">Card 4</SpotlightCard>
            <SpotlightCard key="card-5">Card 5</SpotlightCard>
            <SpotlightCard key="card-6">Card 6</SpotlightCard>
          </div>
        )}

        {activeTab === "inventory" && <DevboxTable />}
      </div>
    </div>
  );
}
