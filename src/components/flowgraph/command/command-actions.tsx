"use client";

interface CommandActionsProps {
  onOpenChange: (open: boolean) => void;
  setSearch: (search: string) => void;
  setSelectedCommand: (command: string | null) => void;
  setShowResourceList: (show: boolean) => void;
}

export function useCommandActions({
  onOpenChange,
  setSearch,
  setSelectedCommand,
  setShowResourceList,
}: CommandActionsProps) {
  const resetAndClose = () => {
    onOpenChange(false);
    setSearch("");
    setSelectedCommand(null);
    setShowResourceList(false);
  };

  const handleSelect = (value: string) => {
    if (value === "add-resource") {
      setShowResourceList(true);
    }
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedCommand(resourceId);
  };

  const handleBack = () => {
    if (setSelectedCommand) {
      setSelectedCommand(null);
    } else {
      setShowResourceList(false);
    }
  };

  return { handleSelect, handleResourceSelect, handleBack, resetAndClose };
}
