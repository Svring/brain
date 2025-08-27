import { useState } from "react";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Custom Hooks and Types
import type { Port } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { Separator } from "@/components/ui/separator";

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

  const handleAddNewClick = () => {
    if (allowEditing) {
      setEditingIndex(ports.length);
    }
  };

  // Render Functions
  const renderPortRow = (port: Port, index: number) => (
    <div
      key={`${port.number}-${index}`}
      className="flex items-center bg-transparent justify-between py-2 px-3 border-b border-border/50 last:border-b-0"
    >
      <div className="flex items-center gap-4 flex-1">
        {editingIndex === index ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Port:</span>
              <Input
                type="number"
                value={newPort.number}
                onChange={(e) =>
                  setNewPort({
                    ...newPort,
                    number: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Port number"
                min="1"
                max="65535"
                className="w-20 h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Public Access:
              </span>
              <Switch
                checked={newPort.publicAccess}
                onCheckedChange={(checked) =>
                  setNewPort({ ...newPort, publicAccess: checked })
                }
              />
              <span className="text-sm text-muted-foreground">
                {newPort.publicAccess ? "True" : "False"}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              <span className="text-muted-foreground">Port:</span> {port.number}
            </span>
            <span className="text-sm">
              <span className="text-muted-foreground">Public Access:</span>{" "}
              {port.publicAccess ? "True" : "False"}
            </span>
          </div>
        )}
      </div>

      {allowEditing && (
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
      )}
    </div>
  );

  const renderNewPortRow = () => (
    <div className="flex items-center justify-between py-2 px-3 border-b border-border/50">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Port:</span>
          <Input
            type="number"
            value={newPort.number}
            onChange={(e) =>
              setNewPort({ ...newPort, number: parseInt(e.target.value) || 0 })
            }
            placeholder="Port number"
            min="1"
            max="65535"
            className="w-20 h-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Public Access:</span>
          <Switch
            checked={newPort.publicAccess}
            onCheckedChange={(checked) =>
              setNewPort({ ...newPort, publicAccess: checked })
            }
          />
          <span className="text-sm text-muted-foreground">
            {newPort.publicAccess ? "True" : "False"}
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        <Button onClick={handleAdd} size="sm" disabled={!newPort.number}>
          <Check className="w-3 h-3" />
        </Button>
        <Button onClick={handleCancel} variant="ghost" size="sm">
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  const renderAddButton = () => (
    <div
      className="flex items-center justify-center py-3 px-3 cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
      onClick={handleAddNewClick}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add new port</span>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="space-y-2 border rounded-lg">
      {ports.map((port, index) => renderPortRow(port, index))}
      {allowEditing && editingIndex === ports.length && renderNewPortRow()}
      {allowEditing && editingIndex !== ports.length && renderAddButton()}
    </div>
  );
}
