"use client";

interface CommandActionsProps {
  onOpenChange: (open: boolean) => void;
  setSearch: (search: string) => void;
  setSelectedCommand: (command: string | null) => void;
  setShowResourceList: (show: boolean) => void;
  setShowManageResources: (show: boolean) => void;
  setShowExistingResources: (show: boolean) => void;
}

export function useCommandActions({
  onOpenChange,
  setSearch,
  setSelectedCommand,
  setShowResourceList,
  setShowManageResources,
  setShowExistingResources,
}: CommandActionsProps) {
  const resetAndClose = () => {
    onOpenChange(false);
    setSearch("");
    setSelectedCommand(null);
    setShowResourceList(false);
    setShowManageResources(false);
    setShowExistingResources(false);
  };

  const handleSelect = (value: string) => {
    if (value === "add-resource") {
      setShowResourceList(true);
    } else if (value === "add-existing-resources") {
      setShowExistingResources(true);
    } else if (value === "manage-resources") {
      setShowManageResources(true);
    }
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedCommand(resourceId);
  };

  const handleBack = () => {
    if (setSelectedCommand) {
      setSelectedCommand(null);
    } else if (setShowManageResources) {
      setShowManageResources(false);
    } else if (setShowExistingResources) {
      setShowExistingResources(false);
    } else {
      setShowResourceList(false);
    }
  };

  return { handleSelect, handleResourceSelect, handleBack, resetAndClose };
}
