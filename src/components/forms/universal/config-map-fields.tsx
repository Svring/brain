"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Edit3 } from "lucide-react";
import { UseFieldArrayReturn, useFormContext } from "react-hook-form";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ConfigMapFieldsProps {
  fieldArray: UseFieldArrayReturn<any, "configMap", "id">;
}

export const ConfigMapFields: React.FC<ConfigMapFieldsProps> = ({
  fieldArray,
}) => {
  const { fields, append, remove } = fieldArray;
  const { register, setValue, watch } = useFormContext();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState("");

  const addConfigMap = () => {
    append({ path: "", value: "" });
  };

  const removeConfigMap = (index: number) => {
    remove(index);
  };

  const openEditDialog = (index: number) => {
    const currentValue = watch(`configMap.${index}.value`) || "";
    setTempValue(currentValue);
    setEditingIndex(index);
  };

  const getCurrentPath = () => {
    if (editingIndex !== null) {
      return watch(`configMap.${editingIndex}.path`) || "";
    }
    return "";
  };

  const closeEditDialog = () => {
    setEditingIndex(null);
    setTempValue("");
  };

  const saveEditDialog = () => {
    if (editingIndex !== null) {
      setValue(`configMap.${editingIndex}.value`, tempValue);
    }
    closeEditDialog();
  };

  return (
    <>
      <div className="space-y-2 border border-border rounded-lg p-4">
        {/* Table Header - only show when there are items */}
        {fields.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
            <div>Path</div>
            <div>Content</div>
            <div></div>
          </div>
        )}

        {/* Table Rows */}
        <div className="space-y-0 py-0">
          {fields.map((field, index) => {
            const currentValue = watch(`configMap.${index}.value`) || "";
            const displayValue = currentValue.length > 50 
              ? `${currentValue.substring(0, 50)}...` 
              : currentValue || "Click to edit content";

            return (
              <div key={field.id} className="grid grid-cols-3 gap-4 items-center">
                {/* Path Column */}
                <div>
                  <Input
                    placeholder="Path (e.g., /etc/config/app.conf)"
                    {...register(`configMap.${index}.path`)}
                    className="w-full border-none shadow-none focus-visible:ring-0 bg-transparent! pl-0"
                  />
                </div>

                {/* Content Column */}
                <div>
                  <div
                    className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-muted/20 rounded p-2 -m-2"
                    onClick={() => openEditDialog(index)}
                    title="Click to edit content"
                  >
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      {displayValue}
                    </span>
                    <Edit3 className="h-3 w-3 text-muted-foreground/60" />
                  </div>
                </div>

                {/* Delete Button Column */}
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConfigMap(index)}
                    className="text-destructive hover:text-destructive border-none bg-transparent shadow-none hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Config Map Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addConfigMap}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Config Map Entry
        </Button>
      </div>

      {/* Content Edit Dialog */}
      <Dialog open={editingIndex !== null} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Config Map Content</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={closeEditDialog}
                >
                  <X />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={saveEditDialog}
                >
                  ✓
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-3">
            {/* Path Display */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Path:</label>
              <div className="mt-1 p-2 bg-muted/50 rounded border font-mono text-sm">
                {getCurrentPath() || "No path specified"}
              </div>
            </div>
            
            {/* Content Textarea */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Content:</label>
              <Textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder="Enter config map content..."
                className="min-h-[300px] font-mono text-sm mt-1"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
