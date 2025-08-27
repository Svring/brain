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
import { Switch } from "@/components/ui/switch";

// Custom Hooks and Types
import { useCopy } from "@/hooks/use-copy";
import type { Port } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

// Component Props
interface ProjectPortTableProps {
  ports: Port[];
  allowEditing?: boolean;
  onPortsChange?: (ports: Port[]) => void;
}

// New Port State
interface NewPort {
  number: number;
  publicAccess: boolean;
}

export function ProjectPortTable({
  ports,
  allowEditing = false,
  onPortsChange,
}: ProjectPortTableProps) {
  // State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPort, setNewPort] = useState<NewPort>({
    number: 3000,
    publicAccess: false,
  });
  const { copyToClipboard, isCopied } = useCopy();

  // Handlers for Add/Edit/Delete Operations
  const handleAdd = () => {
    if (!newPort.number || !onPortsChange) return;

    const port: Port = {
      number: newPort.number,
      publicAccess: newPort.publicAccess,
    };

    onPortsChange([...ports, port]);
    setNewPort({ number: 3000, publicAccess: false });
    setEditingIndex(null);
  };

  const handleEdit = (index: number, port: Port) => {
    setNewPort({
      number: port.number,
      publicAccess: port.publicAccess,
    });
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    if (!newPort.number || !onPortsChange) return;

    const updatedPort: Port = {
      number: newPort.number,
      publicAccess: newPort.publicAccess,
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
    setNewPort({ number: 3000, publicAccess: false });
  };

  const handleEmptyRowClick = () => {
    if (allowEditing) {
      setEditingIndex(ports.length);
    }
  };

  // Render Functions
  const renderNumberCell = (port: Port, index: number) => (
    <TableCell className="font-medium">
      {editingIndex === index ? (
        <Input
          type="number"
          value={newPort.number}
          onChange={(e) => setNewPort({ ...newPort, number: parseInt(e.target.value) || 0 })}
          placeholder="Port number"
          min="1"
          max="65535"
        />
      ) : (
        <div
          className="cursor-pointer hover:underline flex items-center gap-2 group"
          onClick={() => copyToClipboard(port.number.toString(), `port-${index}`)}
          title="Click to copy"
        >
          <span>{port.number}</span>
          {isCopied(`port-${index}`) ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </TableCell>
  );

  const renderAccessCell = (port: Port, index: number) => (
    <TableCell>
      {editingIndex === index ? (
        <div className="flex items-center space-x-2">
          <Switch
            checked={newPort.publicAccess}
            onCheckedChange={(checked) => setNewPort({ ...newPort, publicAccess: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {newPort.publicAccess ? "Public" : "Private"}
          </span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${port.publicAccess ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm">{port.publicAccess ? "Public" : "Private"}</span>
        </div>
      )}
    </TableCell>
  );

  const renderActionCell = (port: Port, index: number) => (
    <TableCell>
      <div className="flex gap-1">
        {editingIndex === index ? (
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
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(index, port)}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(index)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </TableCell>
  );

  const renderEmptyRow = () => (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
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

  const renderNewPortRow = () => (
    <TableRow>
      <TableCell className="font-medium">
        <Input
          type="number"
          value={newPort.number}
          onChange={(e) => setNewPort({ ...newPort, number: parseInt(e.target.value) || 0 })}
          placeholder="Port number"
          min="1"
          max="65535"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Switch
            checked={newPort.publicAccess}
            onCheckedChange={(checked) => setNewPort({ ...newPort, publicAccess: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {newPort.publicAccess ? "Public" : "Private"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            onClick={handleAdd}
            size="sm"
            disabled={!newPort.number}
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button onClick={handleCancel} variant="ghost" size="sm">
            <X className="w-3 h-3" />
          </Button>
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
            <TableHead className="w-[40%]">Port</TableHead>
            <TableHead className="w-[40%]">Access</TableHead>
            {allowEditing && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port, index) => (
            <TableRow key={`${port.number}-${index}`}>
              {renderNumberCell(port, index)}
              {renderAccessCell(port, index)}
              {allowEditing && renderActionCell(port, index)}
            </TableRow>
          ))}
          {allowEditing && editingIndex !== ports.length && renderEmptyRow()}
          {allowEditing &&
            editingIndex === ports.length &&
            renderNewPortRow()}
        </TableBody>
      </Table>
    </div>
  );
}
