import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnvPair {
  id: number;
  key: string;
  value: string;
  isEditing: boolean;
  error: string;
}

interface EnvEditorProps {
  initialPairs?: EnvPair[];
  onSave?: (pairs: EnvPair[]) => void;
  onCancel?: () => void;
  title?: string;
  showHeader?: boolean;
}

const EnvEditor = ({ 
  initialPairs = [], 
  onSave, 
  onCancel, 
  title = "Environment Variables",
  showHeader = true 
}: EnvEditorProps) => {
  const [pairs, setPairs] = useState<EnvPair[]>(
    initialPairs.length > 0 
      ? initialPairs 
      : [
          { id: 1, key: "name", value: "John Doe", isEditing: false, error: "" },
          {
            id: 2,
            key: "email",
            value: "john@example.com",
            isEditing: false,
            error: "",
          },
          { id: 3, key: "role", value: "Developer", isEditing: false, error: "" },
        ]
  );

  const addPair = () => {
    const newPair = {
      id: Date.now(),
      key: "",
      value: "",
      isEditing: true,
      error: "",
    };
    setPairs([...pairs, newPair]);
  };

  const removePair = (id: number) => {
    setPairs(pairs.filter((pair) => pair.id !== id));
  };

  const toggleEdit = (id: number) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === id ? { ...pair, isEditing: !pair.isEditing } : pair
      )
    );
  };

  const updatePair = (id: number, field: string, value: string) => {
    setPairs(
      pairs.map((pair) => {
        if (pair.id === id) {
          let error = "";
          if (!value.trim()) {
            error = `${field} cannot be empty`;
          }
          return { ...pair, [field]: value, error };
        }
        return pair;
      })
    );
  };

  const validatePair = (pair: EnvPair) => {
    return pair.key.trim() !== "" && pair.value.trim() !== "";
  };

  const handleSave = () => {
    // Validate all pairs before saving
    const hasErrors = pairs.some(pair => !validatePair(pair));
    if (hasErrors) {
      // Mark all invalid pairs as editing
      setPairs(pairs.map(pair => ({
        ...pair,
        isEditing: !validatePair(pair)
      })));
      return;
    }
    
    if (onSave) {
      onSave(pairs);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="w-full">
      {showHeader && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {pairs.map((pair) => (
          <div
            key={pair.id}
            className={`group transition-all duration-300 ${
              pair.error ? "animate-shake" : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:border-ring transition-colors duration-200 bg-card">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`key-${pair.id}`}>Key</Label>
                <Input
                  type="text"
                  id={`key-${pair.id}`}
                  value={pair.key}
                  onChange={(e) =>
                    updatePair(pair.id, "key", e.target.value)
                  }
                  disabled={!pair.isEditing}
                  className={pair.error ? "border-destructive" : ""}
                  aria-label="Key input"
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor={`value-${pair.id}`}>Value</Label>
                <Input
                  type="text"
                  id={`value-${pair.id}`}
                  value={pair.value}
                  onChange={(e) =>
                    updatePair(pair.id, "value", e.target.value)
                  }
                  disabled={!pair.isEditing}
                  className={pair.error ? "border-destructive" : ""}
                  aria-label="Value input"
                />
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleEdit(pair.id)}
                  aria-label={pair.isEditing ? "Save" : "Edit"}
                >
                  {pair.isEditing ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Edit2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePair(pair.id)}
                  aria-label="Remove pair"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {pair.error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{pair.error}</AlertDescription>
              </Alert>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between">
          <Button
            onClick={addPair}
            variant="outline"
            aria-label="Add new pair"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Variable
          </Button>

          {(onSave || onCancel) && (
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
              {onSave && (
                <Button
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default EnvEditor;
