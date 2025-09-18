"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
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

  const handleAddPort = () => {
    const portNum = parseInt(newPortNumber);
    if (!portNum || portNum < 1 || portNum > 65535 || !onPortsChange) return;
    
    // Check if port already exists
    if (ports.includes(portNum)) return;
    
    onPortsChange([...ports, portNum]);
    setNewPortNumber("");
  };

  const handleRemovePort = (portToRemove: number) => {
    if (!onPortsChange) return;
    onPortsChange(ports.filter(port => port !== portToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPort();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-muted-foreground">Ports:</div>
        
        {/* Display existing ports */}
        {ports.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ports.map((port) => (
              <div key={port} className="flex items-center gap-1">
                <Badge variant="outline" className="font-mono" size={'small'}>
                  {port}
                </Badge>
                {allowEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemovePort(port)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : !allowEditing ? (
          <div className="text-sm text-muted-foreground">No ports configured</div>
        ) : null}
      </div>

      {/* Add new port */}
      {allowEditing && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={newPortNumber}
            onChange={(e) => setNewPortNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Port number"
            min="1"
            max="65535"
            className="w-24 h-8"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPort}
            disabled={!newPortNumber || parseInt(newPortNumber) < 1 || parseInt(newPortNumber) > 65535}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
