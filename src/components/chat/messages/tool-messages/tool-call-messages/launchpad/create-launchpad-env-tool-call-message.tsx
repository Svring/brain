import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface EnvVar {
  name: string;
  value: string;
}

interface CreateLaunchpadEnvToolCallMessageProps {
  launchpad_name: string;
  env_vars: EnvVar[];
  setInterruptData?: (data: any) => void;
}

export function CreateLaunchpadEnvToolCallMessage({
  launchpad_name,
  env_vars,
  setInterruptData,
}: CreateLaunchpadEnvToolCallMessageProps) {
  // State to track current values for interactive inputs
  const [currentEnvVars, setCurrentEnvVars] = useState<EnvVar[]>(env_vars);

  // Update state when props change
  useEffect(() => {
    setCurrentEnvVars(env_vars);
  }, [env_vars]);

  // Handle env var changes to update interrupt data
  const handleEnvVarChange = (index: number, field: 'name' | 'value', newValue: string) => {
    const updatedEnvVars = [...currentEnvVars];
    updatedEnvVars[index] = {
      ...updatedEnvVars[index],
      [field]: newValue,
    };
    setCurrentEnvVars(updatedEnvVars);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          env_vars: updatedEnvVars,
        },
      }));
    }
  };

  // Add new env var
  const handleAddEnvVar = () => {
    const newEnvVars = [...currentEnvVars, { name: '', value: '' }];
    setCurrentEnvVars(newEnvVars);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          env_vars: newEnvVars,
        },
      }));
    }
  };

  // Remove env var
  const handleRemoveEnvVar = (index: number) => {
    const newEnvVars = currentEnvVars.filter((_, i) => i !== index);
    setCurrentEnvVars(newEnvVars);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          env_vars: newEnvVars,
        },
      }));
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2 border border-border rounded-lg p-4">
        {/* Table Header - only show when there are items */}
        {currentEnvVars.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
            <div>Name</div>
            <div>Value</div>
            <div>Action</div>
          </div>
        )}

        {/* Table Rows */}
        <div className="space-y-0 py-0">
          {currentEnvVars.map((envVar, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-center">
              {/* Name Column */}
              <div>
                <input
                  type="text"
                  value={envVar.name}
                  onChange={(e) => handleEnvVarChange(index, 'name', e.target.value)}
                  placeholder="Variable name"
                  className="w-full border-none shadow-none focus-visible:ring-0 focus:outline-none bg-transparent pl-0 text-sm"
                  disabled={!setInterruptData}
                />
              </div>

              {/* Value Column */}
              <div>
                <input
                  type="text"
                  value={envVar.value}
                  onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="w-full border-none shadow-none focus-visible:ring-0 focus:outline-none bg-transparent pl-0 text-sm"
                  disabled={!setInterruptData}
                />
              </div>

              {/* Action Column */}
              <div>
                {setInterruptData && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEnvVar(index)}
                    className="text-destructive hover:text-destructive border-none bg-transparent shadow-none hover:bg-transparent p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Environment Variable Button */}
        {setInterruptData && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddEnvVar}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-border rounded hover:bg-accent transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Variable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
