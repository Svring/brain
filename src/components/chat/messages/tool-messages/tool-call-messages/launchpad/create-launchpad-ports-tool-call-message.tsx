import { useState, useEffect } from "react";

interface CreateLaunchpadPortsToolCallMessageProps {
  launchpad_name: string;
  ports: number[];
  setInterruptData?: (data: any) => void;
}

export function CreateLaunchpadPortsToolCallMessage({
  launchpad_name,
  ports,
  setInterruptData,
}: CreateLaunchpadPortsToolCallMessageProps) {
  // State to track current values for interactive inputs
  const [currentPorts, setCurrentPorts] = useState<number[]>(ports);

  // Update state when props change
  useEffect(() => {
    setCurrentPorts(ports);
  }, [ports]);

  // Handle port changes to update interrupt data
  const handlePortChange = (index: number, newPort: string) => {
    const portNum = parseInt(newPort);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) return;

    const updatedPorts = [...currentPorts];
    updatedPorts[index] = portNum;
    setCurrentPorts(updatedPorts);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          ports: updatedPorts,
        },
      }));
    }
  };

  // Add new port
  const handleAddPort = () => {
    const newPorts = [...currentPorts, 3000]; // Default port
    setCurrentPorts(newPorts);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          ports: newPorts,
        },
      }));
    }
  };

  // Remove port
  const handleRemovePort = (index: number) => {
    const newPorts = currentPorts.filter((_, i) => i !== index);
    setCurrentPorts(newPorts);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          ports: newPorts,
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
          <span className="text-sm font-medium text-muted-foreground">Ports:</span>

          {currentPorts.map((port, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-border rounded-md">
              <input
                type="number"
                value={port}
                onChange={(e) => handlePortChange(index, e.target.value)}
                min="1"
                max="65535"
                className="w-20 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                disabled={!setInterruptData}
              />
              <span className="text-sm text-muted-foreground">Port {index + 1}</span>
              {setInterruptData && currentPorts.length > 0 && (
                <button
                  onClick={() => handleRemovePort(index)}
                  className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {setInterruptData && (
            <button
              onClick={handleAddPort}
              className="px-3 py-1 text-sm text-primary hover:bg-primary/10 border border-primary/20 rounded transition-colors"
            >
              + Add Port
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
