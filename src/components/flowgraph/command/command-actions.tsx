"use client";

interface CommandActionsProps {
  onOpenChange: (open: boolean) => void;
  setSearch: (search: string) => void;
  setSelectedCommand: (command: string | null) => void;
  setIsDetailMode: (isDetail: boolean) => void;
}

export function useCommandActions({
  onOpenChange,
  setSearch,
  setSelectedCommand,
  setIsDetailMode,
}: CommandActionsProps) {
  const resetAndClose = () => {
    onOpenChange(false);
    setSearch("");
    setSelectedCommand(null);
    setIsDetailMode(false);
  };

  const handleSelect = (value: string) => {
    switch (value) {
      case "add-resource":
        setSelectedCommand("add-resource");
        setIsDetailMode(true);
        break;
      case "environment":
        setSelectedCommand("environment");
        setIsDetailMode(true);
        break;
    }
  };

  return { handleSelect };
}
