"use client";

import { useState } from "react";
import { Trash2, Plus, Edit2, Check, X, Copy, CheckCircle } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  protocol: string;
  publicAccess: boolean;
  customDomain: string;
}

export function PortsTable({
  ports,
  allowEditing = false,
  onPortsChange,
}: PortsTableProps) {
  // State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPort, setNewPort] = useState<NewPort>({
    number: 80,
    protocol: "TCP",
    publicAccess: false,
    customDomain: "",
  });
  const { copyToClipboard, isCopied } = useCopy();

  // Handlers for Add/Edit/Delete Operations
  const handleAdd = () => {
    if (!newPort.number || !onPortsChange) return;

    const port: Port = {
      number: newPort.number,
      protocol: newPort.protocol,
      ...(newPort.publicAccess && {
        publicAddress: `port-${newPort.number}.example.com`,
      }),
      ...(newPort.customDomain && { host: newPort.customDomain }),
    };

    onPortsChange([...ports, port]);
    setNewPort({
      number: 80,
      protocol: "TCP",
      publicAccess: false,
      customDomain: "",
    });
    setEditingIndex(null);
    setDialogOpen(false);
  };

  const handleEdit = (index: number, port: Port) => {
    setNewPort({
      number: port.number,
      protocol: port.protocol || "TCP",
      publicAccess: !!port.publicAddress,
      customDomain: port.host || "",
    });
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSave = (index: number) => {
    if (!newPort.number || !onPortsChange) return;

    const updatedPort: Port = {
      number: newPort.number,
      protocol: newPort.protocol,
      ...(newPort.publicAccess && {
        publicAddress: `port-${newPort.number}.example.com`,
      }),
      ...(newPort.customDomain && { host: newPort.customDomain }),
    };

    const newPorts = [...ports];
    newPorts[index] = updatedPort;
    onPortsChange(newPorts);
    setEditingIndex(null);
    setDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    if (!onPortsChange) return;
    onPortsChange(ports.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setDialogOpen(false);
    setNewPort({
      number: 80,
      protocol: "TCP",
      publicAccess: false,
      customDomain: "",
    });
  };

  const handleEmptyRowClick = () => {
    if (allowEditing) {
      setNewPort({
        number: 80,
        protocol: "TCP",
        publicAccess: false,
        customDomain: "",
      });
      setEditingIndex(ports.length);
      setDialogOpen(true);
    }
  };

  // Render Functions
  const renderPortRow = (port: Port, index: number) => (
    <TableRow key={`${port.number}-${index}`}>
      <TableCell className="font-medium">
        <div
          className="cursor-pointer hover:underline flex items-center gap-2 group"
          onClick={() =>
            copyToClipboard(port.number.toString(), `number-${index}`)
          }
          title="Click to copy"
        >
          <span>{port.number}</span>
          {isCopied(`number-${index}`) ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div
          className="cursor-pointer hover:underline flex items-center gap-2 group"
          onClick={() =>
            port.privateAddress &&
            copyToClipboard(port.privateAddress, `private-${index}`)
          }
          title="Click to copy"
        >
          <span>{port.privateAddress || "N/A"}</span>
          {port.privateAddress &&
            (isCopied(`private-${index}`) ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            ))}
        </div>
      </TableCell>
      <TableCell>
        <div
          className="cursor-pointer hover:underline flex items-center gap-2 group"
          onClick={() =>
            port.publicAddress &&
            copyToClipboard(port.publicAddress, `public-${index}`)
          }
          title="Click to copy"
        >
          <span>{port.publicAddress || "N/A"}</span>
          {port.publicAddress &&
            (isCopied(`public-${index}`) ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            ))}
        </div>
      </TableCell>
      {allowEditing && (
        <TableCell>
          <div className="flex gap-1">
            <Dialog
              open={dialogOpen && editingIndex === index}
              onOpenChange={(open) => {
                if (!open) {
                  handleCancel();
                } else {
                  setDialogOpen(open);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(index, port)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingIndex === ports.length
                      ? "Add New Port"
                      : "Edit Port"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingIndex === ports.length
                      ? "Configure settings for the new port."
                      : "Configure port settings and access options."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="number" className="text-right">
                      Port Number
                    </Label>
                    <Input
                      id="number"
                      type="number"
                      value={newPort.number}
                      onChange={(e) =>
                        setNewPort({
                          ...newPort,
                          number: parseInt(e.target.value) || 0,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="public-access" className="text-right">
                      Public Access
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="public-access"
                        checked={newPort.publicAccess}
                        onCheckedChange={(checked) =>
                          setNewPort({ ...newPort, publicAccess: checked })
                        }
                      />
                      <span className="text-sm">Enable public access</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="protocol" className="text-right">
                      Protocol
                    </Label>
                    <Select
                      value={newPort.protocol}
                      onValueChange={(value) =>
                        setNewPort({ ...newPort, protocol: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TCP">TCP</SelectItem>
                        <SelectItem value="UDP">UDP</SelectItem>
                        <SelectItem value="SCTP">SCTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="custom-domain" className="text-right">
                      Custom Domain
                    </Label>
                    <Input
                      id="custom-domain"
                      value={newPort.customDomain}
                      onChange={(e) =>
                        setNewPort({ ...newPort, customDomain: e.target.value })
                      }
                      placeholder="Optional custom domain"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (editingIndex === ports.length) {
                        handleAdd();
                      } else {
                        handleSave(index);
                      }
                    }}
                    disabled={!newPort.number}
                  >
                    {editingIndex === ports.length
                      ? "Add Port"
                      : "Save changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  const renderEmptyRow = () => (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 border-dashed border-t-2"
      onClick={handleEmptyRowClick}
    >
      <TableCell
        colSpan={allowEditing ? 4 : 3}
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
    <div className="space-y-4 border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Port Number</TableHead>
            <TableHead className="w-[37%]">Private Address</TableHead>
            <TableHead className="w-[38%]">Public Address</TableHead>
            {allowEditing && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port, index) => renderPortRow(port, index))}
          {allowEditing && renderEmptyRow()}
        </TableBody>
      </Table>

      {/* Dialog for adding new ports */}
      <Dialog
        open={dialogOpen && editingIndex === ports.length}
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          } else {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Port</DialogTitle>
            <DialogDescription>
              Configure settings for the new port.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="number" className="text-right">
                Port Number
              </Label>
              <Input
                id="number"
                type="number"
                value={newPort.number}
                onChange={(e) =>
                  setNewPort({
                    ...newPort,
                    number: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="public-access" className="text-right">
                Public Access
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="public-access"
                  checked={newPort.publicAccess}
                  onCheckedChange={(checked) =>
                    setNewPort({ ...newPort, publicAccess: checked })
                  }
                />
                <span className="text-sm">Enable public access</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="protocol" className="text-right">
                Protocol
              </Label>
              <Select
                value={newPort.protocol}
                onValueChange={(value) =>
                  setNewPort({ ...newPort, protocol: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TCP">TCP</SelectItem>
                  <SelectItem value="UDP">UDP</SelectItem>
                  <SelectItem value="SCTP">SCTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-domain" className="text-right">
                Custom Domain
              </Label>
              <Input
                id="custom-domain"
                value={newPort.customDomain}
                onChange={(e) =>
                  setNewPort({ ...newPort, customDomain: e.target.value })
                }
                placeholder="Optional custom domain"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!newPort.number}
            >
              Add Port
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
