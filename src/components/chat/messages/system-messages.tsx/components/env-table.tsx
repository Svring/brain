import { useState } from "react";
import { Trash2, Plus, Edit2, Check, X, Copy, CheckCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const renderEnvVarItem = (envVar: EnvVar, index: number) => {
    const isEditing = allowEditing && editingIndex === index;

    return (
      <div key={`${envVar.name}-${index}`} className="flex items-center gap-3 rounded-lg">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-[30%]">
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
                <span className="font-medium">{envVar.name}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div
                className="cursor-pointer hover:underline flex items-center gap-2 group"
                onClick={() => copyToClipboard(envVar.name, `name-${index}`)}
                title="Click to copy"
              >
                <span className="font-medium">{envVar.name}</span>
                {isCopied(`name-${index}`) ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
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
          </div>
        </div>
        {allowEditing && (
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
                variant="outline"
                size="sm"
                onClick={() => handleDelete(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderNewEnvVarItem = () => (
    <div className="flex items-center gap-3 rounded-lg">
      <div className="flex-1 flex items-center gap-3">
        <div className="w-[30%]">
          <Input
            value={newEnvVar.name}
            onChange={(e) => setNewEnvVar({ ...newEnvVar, name: e.target.value })}
            placeholder="Environment variable name"
          />
        </div>
        <div className="flex-1">
          <Input
            value={newEnvVar.value}
            onChange={(e) =>
              setNewEnvVar({ ...newEnvVar, value: e.target.value })
            }
            placeholder="Environment variable value"
          />
        </div>
      </div>
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
    </div>
  );

  // Main Render
  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <div className="space-y-3">
        {envVars.map((envVar, index) => renderEnvVarItem(envVar, index))}
        {allowEditing && editingIndex !== envVars.length && (
          <Button
            type="button"
            variant="outline"
            onClick={handleEmptyRowClick}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Environment Variable
          </Button>
        )}
        {allowEditing && editingIndex === envVars.length && renderNewEnvVarItem()}
      </div>
    </div>
  );
}
