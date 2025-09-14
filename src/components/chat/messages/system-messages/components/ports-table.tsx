"use client";

import { useState } from "react";
import { Trash2, Plus, Check, X } from "lucide-react";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Custom Hooks and Types
import { useCopy } from "@/hooks/use-copy";
import type { Port } from "@/lib/sealos/resources/deployment/deployment-object-schema";

// Component Props
interface PortsTableProps {
  ports: Port[];
  allowEditing?: boolean;
  onPortsChange?: (ports: Port[]) => void;
}

// New Port State
interface NewPort {
  number: number;
  publicAccess: boolean;
}

export function PortsTable({
  ports,
  allowEditing = false,
  onPortsChange,
}: PortsTableProps) {
  // State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPort, setNewPort] = useState<NewPort>({
    number: 80,
    publicAccess: false,
  });
  const { copyToClipboard, isCopied } = useCopy();

  // Handlers for Add/Edit/Delete Operations
  const handleAdd = () => {
    if (!newPort.number || !onPortsChange) return;

    const port: Port = {
      number: newPort.number,
      protocol: "TCP",
      ...(newPort.publicAccess && {
        publicAddress: `port-${newPort.number}.example.com`,
      }),
    };

    onPortsChange([...ports, port]);
    setNewPort({
      number: 80,
      publicAccess: false,
    });
    setEditingIndex(null);
  };

  const handleEdit = (index: number, port: Port) => {
    setNewPort({
      number: port.number,
      publicAccess: !!port.publicAddress,
    });
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    if (!newPort.number || !onPortsChange) return;

    const updatedPort: Port = {
      number: newPort.number,
      protocol: "TCP",
      ...(newPort.publicAccess && {
        publicAddress: `port-${newPort.number}.example.com`,
      }),
    };

    const newPorts = [...ports];
    newPorts[index] = updatedPort;
    onPortsChange(newPorts);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (!onPortsChange) return;
    onPortsChange(ports.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setNewPort({
      number: 80,
      publicAccess: false,
    });
  };

  const handleEmptyRowClick = () => {
    if (allowEditing) {
      setNewPort({
        number: 80,
        publicAccess: false,
      });
      setEditingIndex(ports.length);
    }
  };

  // Render Functions
  const renderPortRow = (port: Port, index: number) => {
    const isEditing = allowEditing && editingIndex === index;

    return (
      <TableRow key={`${port.number}-${index}`}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {allowEditing ? (
              <Input
                type="number"
                value={isEditing ? newPort.number : port.number}
                onChange={(e) => {
                  if (isEditing) {
                    setNewPort({
                      ...newPort,
                      number: parseInt(e.target.value) || 0,
                    });
                  } else {
                    // Direct update for inline editing
                    const updatedPorts = [...ports];
                    updatedPorts[index] = {
                      ...updatedPorts[index],
                      number: parseInt(e.target.value) || 0,
                    };
                    onPortsChange?.(updatedPorts);
                  }
                }}
                placeholder="Port number"
                min="1"
                max="65535"
                className="w-20 h-8"
              />
            ) : (
              <span>{port.number}</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {allowEditing ? (
              <div className="flex items-center gap-2">
                <Switch
                  checked={isEditing ? newPort.publicAccess : !!port.publicAddress}
                  onCheckedChange={(checked) => {
                    if (isEditing) {
                      setNewPort({ ...newPort, publicAccess: checked });
                    } else {
                      // Direct update for inline editing
                      const updatedPorts = [...ports];
                      updatedPorts[index] = {
                        ...updatedPorts[index],
                        publicAddress: checked ? `port-${port.number}.example.com` : undefined,
                      };
                      onPortsChange?.(updatedPorts);
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {(isEditing ? newPort.publicAccess : !!port.publicAddress) ? "Yes" : "No"}
                </span>
              </div>
            ) : (
              <span
                className={
                  port.publicAddress ? "text-green-600" : "text-muted-foreground"
                }
              >
                {port.publicAddress ? "Yes" : "No"}
              </span>
            )}
          </div>
        </TableCell>
        {allowEditing && (
          <TableCell>
            <div className="flex gap-1">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSave(index)}
                    disabled={!newPort.number}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  };

  const renderEmptyRow = () => (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 border-dashed border-t-2"
      onClick={handleEmptyRowClick}
    >
      <TableCell
        colSpan={allowEditing ? 3 : 2}
        className="text-center text-muted-foreground py-4 px-6"
      >
        <div className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Click to add new port
        </div>
      </TableCell>
    </TableRow>
  );

  // Main Render
  return (
    <div className="w-full space-y-2">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Port Number</TableHead>
            <TableHead className="w-[40%]">Public Access</TableHead>
            {allowEditing && <TableHead className="w-[30%]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port, index) => renderPortRow(port, index))}
          {allowEditing && renderEmptyRow()}
        </TableBody>
      </Table>
    </div>
  );
}
