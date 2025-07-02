"use client";

import { Plus } from "lucide-react";
import { SpotlightCard } from "@/components/app/base/spotlight-card";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center p-8">
      {/* Header */}
      <div className="mb-8 flex w-4xl">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="mr-4 font-semibold text-lg">
            Project | Inventory
          </span>
          <Button
            aria-label="Add New"
            className="inline-flex items-center justify-center text-foreground transition-colors focus:outline-none"
            variant="ghost"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
      {/* Responsive Grid */}
      <div className="grid w-4xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        <SpotlightCard key="card-1">Card 1</SpotlightCard>
        <SpotlightCard key="card-2">Card 2</SpotlightCard>
        <SpotlightCard key="card-3">Card 3</SpotlightCard>
        <SpotlightCard key="card-4">Card 4</SpotlightCard>
        <SpotlightCard key="card-5">Card 5</SpotlightCard>
        <SpotlightCard key="card-6">Card 6</SpotlightCard>
      </div>
    </div>
  );
}
