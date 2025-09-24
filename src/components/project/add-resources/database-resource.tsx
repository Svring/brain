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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Search } from "lucide-react";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";
import type { Database } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { generateDefaultName } from "./resource-utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";

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
  const [databaseDialogOpen, setDatabaseDialogOpen] = useState(false);
  const [databaseData, setDatabaseData] = useState<Partial<Database>>({
    name: "",
    type: "postgresql",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { cluster } = useTRPCClients();

  // Fetch existing clusters
  const { data: existingClusters = [], isLoading: isLoadingClusters } = useQuery(
    cluster.list.queryOptions({ type: "cluster" })
  );


  const handleAddDatabase = () => {
    if (databaseData.name?.trim()) {
      const newDatabase: Database = {
        name: databaseData.name.trim(),
        type: databaseData.type || "postgresql",
      };
      onAddDatabase(newDatabase);
      setDatabaseDialogOpen(false);
      setDatabaseData({ name: "", type: "postgresql" });
    }
  };

  const handleSelectExistingCluster = (existingCluster: any) => {
    const database: Database = {
      name: existingCluster.name,
      type: existingCluster.type || "postgresql",
    };
    onAddDatabase(database);
    setDatabaseDialogOpen(false);
    setSearchQuery("");
  };

  // Filter existing clusters based on search query
  const filteredClusters = existingClusters.filter((cluster: any) =>
    cluster.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDatabaseDialog = () => {
    setDatabaseData({
      name: generateDefaultName("database"),
      type: "postgresql",
    });
    setDatabaseDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Database</Label>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={handleOpenDatabaseDialog}
            disabled={isCreating}
          >
            <Plus size={12} />
          </Button>
        </div>
        {databases.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {databases.map((database, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-muted/20 rounded border"
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
                  <img
                    src={
                      CLUSTER_TYPE_ICON_MAP[
                        database.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                      ] || "https://dbprovider.bja.sealos.run/logo.svg"
                    }
                    alt={`${database.type} Icon`}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                </div>
                <span className="text-sm font-medium ml-2 truncate flex-1">
                  {database.type}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                  onClick={() => onDeleteDatabase(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Configuration Dialog */}
      <Dialog open={databaseDialogOpen} onOpenChange={setDatabaseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Database</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="existing">Select Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Name</Label>
                <Input
                  value={databaseData.name || ""}
                  onChange={(e) =>
                    setDatabaseData({ ...databaseData, name: e.target.value })
                  }
                  placeholder="Database name"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CLUSTER_TYPES.map((type) => (
                    <div
                      key={type}
                      onClick={() =>
                        setDatabaseData({ ...databaseData, type: type as any })
                      }
                      className={`
                      flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all
                      hover:bg-muted/50 hover:border-primary/50
                      ${
                        databaseData.type === type
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/30"
                      }
                    `}
                    >
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
                        <img
                          src={
                            CLUSTER_TYPE_ICON_MAP[
                              type as keyof typeof CLUSTER_TYPE_ICON_MAP
                            ] || "https://dbprovider.bja.sealos.run/logo.svg"
                          }
                          alt={`${type} Icon`}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                      </div>
                      <span className="text-sm font-medium leading-tight truncate">
                        {type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="existing" className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Databases</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search existing databases..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {isLoadingClusters ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading databases...
                  </div>
                ) : filteredClusters.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {searchQuery ? "No databases found matching your search." : "No existing databases available."}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredClusters.map((cluster: any) => (
                      <div
                        key={cluster.name}
                        onClick={() => handleSelectExistingCluster(cluster)}
                        className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
                          <img
                            src={
                              CLUSTER_TYPE_ICON_MAP[
                                cluster.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                              ] || "https://dbprovider.bja.sealos.run/logo.svg"
                            }
                            alt={`${cluster.type} Icon`}
                            width={20}
                            height={20}
                            className="rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cluster.name}</p>
                          <p className="text-xs text-muted-foreground">{cluster.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDatabaseDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDatabase}
              disabled={!databaseData.name?.trim()}
              className="flex-1"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
