import { useState, useEffect } from "react";

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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Launchpad:</span>
          <span className="text-sm text-foreground font-mono">{launchpad_name}</span>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium text-muted-foreground">Environment Variables:</span>

          {currentEnvVars.map((envVar, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-border rounded-md">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={envVar.name}
                  onChange={(e) => handleEnvVarChange(index, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                  disabled={!setInterruptData}
                />
                <span className="text-sm text-muted-foreground">=</span>
                <input
                  type="text"
                  value={envVar.value}
                  onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                  disabled={!setInterruptData}
                />
              </div>
              {setInterruptData && currentEnvVars.length > 0 && (
                <button
                  onClick={() => handleRemoveEnvVar(index)}
                  className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {setInterruptData && (
            <button
              onClick={handleAddEnvVar}
              className="px-3 py-1 text-sm text-primary hover:bg-primary/10 border border-primary/20 rounded transition-colors"
            >
              + Add Environment Variable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
