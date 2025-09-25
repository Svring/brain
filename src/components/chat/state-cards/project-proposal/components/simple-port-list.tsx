"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SimplePortListProps {
  ports: number[];
  allowEditing?: boolean;
  onPortsChange?: (ports: number[]) => void;
}

export function SimplePortList({
  ports,
  allowEditing = false,
  onPortsChange,
}: SimplePortListProps) {
  const [newPortNumber, setNewPortNumber] = useState<string>("");
  const [isAddingPort, setIsAddingPort] = useState(false);

  const handleAddPort = () => {
    const portNum = parseInt(newPortNumber);
    if (!portNum || portNum < 1 || portNum > 65535 || !onPortsChange) return;

    // Check if port already exists
    if (ports.includes(portNum)) return;

    onPortsChange([...ports, portNum]);
    setNewPortNumber("");
    setIsAddingPort(false);
  };

  const handleRemovePort = (portToRemove: number) => {
    if (!onPortsChange) return;
    onPortsChange(ports.filter((port) => port !== portToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPort();
    }
  };

  const handleCancelAdd = () => {
    setNewPortNumber("");
    setIsAddingPort(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-muted-foreground">Ports:</div>

        {/* Display existing ports and add port button */}
        <div className="flex flex-wrap gap-2">
          {ports.map((port) => (
            <div
              key={port}
              className="flex items-center bg-muted/20 rounded border px-2 py-1"
            >
              <span className="text-sm font-mono mr-2">{port}</span>
              {allowEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-auto"
                  onClick={() => handleRemovePort(port)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {/* Add new port - inline with existing ports */}
          {allowEditing && (
            <>
              {!isAddingPort ? (
                <div
                  className="flex items-center border-2 border-dashed border-muted-foreground/30 rounded px-2 py-1 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setIsAddingPort(true)}
                >
                  <Plus className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">Add</span>
                </div>
              ) : (
                <div className="flex items-center border-2 border-dashed border-muted-foreground/30 rounded px-2 py-1">
                  <Input
                    value={newPortNumber}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setNewPortNumber(value);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Port"
                    className="h-6 text-xs w-16 border-0 bg-transparent! p-0 focus-visible:ring-0"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-primary hover:text-primary-foreground ml-1"
                    onClick={handleAddPort}
                    disabled={
                      !newPortNumber ||
                      parseInt(newPortNumber) < 1 ||
                      parseInt(newPortNumber) > 65535
                    }
                    title="Add port"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                    onClick={handleCancelAdd}
                    title="Cancel"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {ports.length === 0 && !allowEditing && (
          <div className="text-sm text-muted-foreground">
            No ports configured
          </div>
        )}
      </div>
    </div>
  );
}
