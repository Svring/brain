import { useState } from "react";
import { Trash2, Plus, Edit2, Check, X, Copy, CheckCircle } from "lucide-react";

// UI Components
import {
  Table,
  TableBody,
  TableCaption,
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

// Custom Hooks and Types
import { useCopy } from "@/hooks/use-copy";
import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";

// Component Props
interface EnvTableProps {
  envVars: EnvVar[];
  allowEditing?: boolean;
  onEnvVarsChange?: (envVars: EnvVar[]) => void;
}

// New Environment Variable State
interface NewEnvVar {
  name: string;
  value: string;
}

export function EnvTable({
  envVars,
  allowEditing = false,
  onEnvVarsChange,
}: EnvTableProps) {
  // State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newEnvVar, setNewEnvVar] = useState<NewEnvVar>({
    name: "",
    value: "",
  });
  const { copyToClipboard, isCopied } = useCopy();

  // Handlers for Add/Edit/Delete Operations
  const handleAdd = () => {
    if (!newEnvVar.name || !newEnvVar.value || !onEnvVarsChange) return;

    const envVar: EnvVar = {
      type: "value",
      name: newEnvVar.name,
      value: newEnvVar.value,
    };

    onEnvVarsChange([...envVars, envVar]);
    setNewEnvVar({ name: "", value: "" });
    setEditingIndex(null);
  };

  const handleEdit = (index: number, envVar: EnvVar) => {
    setNewEnvVar({
      name: envVar.name,
      value: envVar.type === "value" ? envVar.value : "",
    });
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    if (!newEnvVar.name || !newEnvVar.value || !onEnvVarsChange) return;

    const updatedEnvVar: EnvVar = {
      type: "value",
      name: newEnvVar.name,
      value: newEnvVar.value,
    };

    const newEnvVars = [...envVars];
    newEnvVars[index] = updatedEnvVar;
    onEnvVarsChange(newEnvVars);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (!onEnvVarsChange) return;
    onEnvVarsChange(envVars.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setNewEnvVar({ name: "", value: "" });
  };

  const handleEmptyRowClick = () => {
    if (allowEditing) {
      setEditingIndex(envVars.length);
    }
  };

  // Render Functions
  const renderNameCell = (envVar: EnvVar, index: number) => {
    const isEditing = allowEditing && editingIndex === index;

    return (
      <TableCell className="font-medium">
        {isEditing ? (
          <Input
            value={newEnvVar.name}
            onChange={(e) => setNewEnvVar({ ...newEnvVar, name: e.target.value })}
            placeholder="Environment variable name"
          />
        ) : allowEditing ? (
          <div
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded flex items-center gap-2 group"
            onClick={() => handleEdit(index, envVar)}
            title="Click to edit"
          >
            <span>{envVar.name}</span>
            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline flex items-center gap-2 group"
            onClick={() => copyToClipboard(envVar.name, `name-${index}`)}
            title="Click to copy"
          >
            <span>{envVar.name}</span>
            {isCopied(`name-${index}`) ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        )}
      </TableCell>
    );
  };

  const renderValueCell = (envVar: EnvVar, index: number) => {
    const isEditing = allowEditing && editingIndex === index;

    return (
      <TableCell>
        {isEditing ? (
          <Input
            value={newEnvVar.value}
            onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
            placeholder="Environment variable value"
          />
        ) : allowEditing ? (
          envVar.type === "value" ? (
            <div
              className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded flex items-center gap-2 group"
              onClick={() => handleEdit(index, envVar)}
              title="Click to edit"
            >
              <span>{envVar.value}</span>
              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <span className="text-muted-foreground italic">from secret</span>
          )
        ) : envVar.type === "value" ? (
          <div
            className="cursor-pointer hover:underline flex items-center gap-2 group"
            onClick={() => copyToClipboard(envVar.value, `value-${index}`)}
            title="Click to copy"
          >
            <span>{envVar.value}</span>
            {isCopied(`value-${index}`) ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        ) : (
          <span className="text-muted-foreground italic">from secret</span>
        )}
      </TableCell>
    );
  };

  const renderActionCell = (envVar: EnvVar, index: number) => {
    const isEditing = allowEditing && editingIndex === index;

    return (
      <TableCell>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave(index)}
                disabled={!newEnvVar.name || !newEnvVar.value}
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
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </TableCell>
    );
  };

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
          Click to add new environment variable
        </div>
      </TableCell>
    </TableRow>
  );

  const renderNewEnvVarRow = () => (
    <TableRow>
      <TableCell className="font-medium">
        <Input
          value={newEnvVar.name}
          onChange={(e) => setNewEnvVar({ ...newEnvVar, name: e.target.value })}
          placeholder="Environment variable name"
        />
      </TableCell>
      <TableCell>
        <Input
          value={newEnvVar.value}
          onChange={(e) =>
            setNewEnvVar({ ...newEnvVar, value: e.target.value })
          }
          placeholder="Environment variable value"
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            onClick={handleAdd}
            size="sm"
            disabled={!newEnvVar.name || !newEnvVar.value}
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
            <TableHead className="w-[30%]">Name</TableHead>
            <TableHead className="w-[70%]">Value</TableHead>
            {allowEditing && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {envVars.map((envVar, index) => (
            <TableRow key={`${envVar.name}-${index}`}>
              {renderNameCell(envVar, index)}
              {renderValueCell(envVar, index)}
              {allowEditing && renderActionCell(envVar, index)}
            </TableRow>
          ))}
          {allowEditing && editingIndex !== envVars.length && renderEmptyRow()}
          {allowEditing &&
            editingIndex === envVars.length &&
            renderNewEnvVarRow()}
        </TableBody>
      </Table>
    </div>
  );
}
