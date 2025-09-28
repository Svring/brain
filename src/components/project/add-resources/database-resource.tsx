"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Minus } from "lucide-react";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { AVAILABLE_CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";
import type { Database } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { generateDefaultName } from "./resource-utils";

interface DatabaseResourceProps {
  databases: Database[];
  onAddDatabase: (database: Database) => void;
  onDeleteDatabase: (index: number) => void;
  isCreating: boolean;
}

export function DatabaseResource({
  databases,
  onAddDatabase,
  onDeleteDatabase,
  isCreating,
}: DatabaseResourceProps) {
  // State for database counters per type
  const [databaseCounters, setDatabaseCounters] = useState<Record<string, number>>({
    postgresql: 0,
    mongodb: 0,
    "apecloud-mysql": 0,
    redis: 0,
    kafka: 0,
    milvus: 0,
  });

  // Database counter handlers
  const handleIncrementDatabase = (type: string) => {
    setDatabaseCounters((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    
    // Add database to parent
    const newDatabase: Database = {
      name: generateDefaultName("database"),
      type: type as any,
    };
    onAddDatabase(newDatabase);
  };

  const handleDecrementDatabase = (type: string) => {
    if (databaseCounters[type] > 0) {
      setDatabaseCounters((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1),
      }));
      
      // Remove database from parent (find first matching type)
      const dbIndex = databases.findIndex(db => db.type === type);
      if (dbIndex !== -1) {
        onDeleteDatabase(dbIndex);
      }
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Database</Label>
        <div className="grid grid-cols-3 gap-2">
          {AVAILABLE_CLUSTER_TYPES.map((type) => (
            <div
              key={type}
              className="flex items-center p-2 bg-muted/20 rounded border"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
                <img
                  src={
                    CLUSTER_TYPE_ICON_MAP[
                      type as keyof typeof CLUSTER_TYPE_ICON_MAP
                    ] || "https://dbprovider.bja.sealos.run/logo.svg"
                  }
                  alt={`${type} Icon`}
                  width={20}
                  height={20}
                  className="rounded"
                />
              </div>
              <span className="text-sm font-medium ml-2 truncate flex-1">
                {type}
              </span>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDecrementDatabase(type)}
                  disabled={databaseCounters[type] === 0 || isCreating}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium min-w-[20px] text-center">
                  {databases.filter(db => db.type === type).length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleIncrementDatabase(type)}
                  disabled={isCreating}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </>
  );
}
