"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";
import { useEffect, useMemo } from "react";

export const ClusterTypeField = () => {
  const { setValue, watch, getValues } = useFormContext<ClusterCreateFormData>();
  const selectedType = watch("type");
  const selectedVersion = watch("version");

  // Extract cluster types from the constant data, filtering out types with no versions
  const clusterTypes = useMemo(() => 
    Object.keys(CLUSTER_CONSTANT_TYPE_VERSION).filter(
      (type) => CLUSTER_CONSTANT_TYPE_VERSION[type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION].length > 0
    ), []
  );

  // Get versions for the selected type
  const selectedVersions = selectedType && CLUSTER_CONSTANT_TYPE_VERSION[selectedType as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION]
    ? CLUSTER_CONSTANT_TYPE_VERSION[selectedType as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION]
    : [];

  const handleTypeChange = (type: string) => {
    setValue("type", type);
    // Reset version when type changes
    const versions = CLUSTER_CONSTANT_TYPE_VERSION[type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION];
    if (versions && versions.length > 0) {
      setValue("version", versions[0]);
    } else {
      setValue("version", "");
    }
  };

  const handleVersionChange = (version: string) => {
    setValue("version", version);
  };

  // Auto-select first type and its first version when no type is selected
  useEffect(() => {
    if (!selectedType && clusterTypes.length > 0) {
      const defaultType = clusterTypes[0];
      const versions = CLUSTER_CONSTANT_TYPE_VERSION[defaultType as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION];
      
      console.log("Auto-selecting type:", defaultType);
      console.log("Available versions:", versions);
      
      // Set type first
      setValue("type", defaultType, { shouldValidate: true, shouldDirty: true });
      
      // Set version after a small delay to ensure type is set
      if (versions && versions.length > 0) {
        setTimeout(() => {
          setValue("version", versions[0], { shouldValidate: true, shouldDirty: true });
          console.log("Auto-selected version:", versions[0]);
        }, 0);
      }
    }
  }, [selectedType, clusterTypes, setValue]);

  // Additional effect to ensure version is set when type changes
  useEffect(() => {
    if (selectedType && selectedType !== "") {
      const versions = CLUSTER_CONSTANT_TYPE_VERSION[selectedType as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION];
      
      // console.log("Type changed to:", selectedType);
      // console.log("Current version:", selectedVersion);
      // console.log("Available versions for type:", versions);
      
      // If no version is selected, auto-select the first one
      if ((!selectedVersion || selectedVersion === "") && versions && versions.length > 0) {
        setValue("version", versions[0], { shouldValidate: true, shouldDirty: true });
        console.log("Setting version to:", versions[0]);
      }
    }
  }, [selectedType, selectedVersion, setValue]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="type">Cluster Type</Label>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select cluster type" />
          </SelectTrigger>
          <SelectContent>
            {clusterTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Cluster Version</Label>
        {selectedType && selectedVersions.length > 0 ? (
          <Select value={selectedVersion} onValueChange={handleVersionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {selectedVersions.map((version: string) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : selectedType && selectedVersions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No versions available
          </div>
        ) : (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select type first" />
            </SelectTrigger>
          </Select>
        )}
      </div>
    </div>
  );
};
