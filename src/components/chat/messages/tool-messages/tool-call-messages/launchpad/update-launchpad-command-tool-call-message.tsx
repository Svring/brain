import { useState, useEffect } from "react";

interface LaunchCommand {
  command: string;
  args: string;
}

interface UpdateLaunchpadCommandToolCallMessageProps {
  launchpad_name: string;
  launch_command: LaunchCommand;
  setInterruptData?: (data: any) => void;
}

export function UpdateLaunchpadCommandToolCallMessage({
  launchpad_name,
  launch_command,
  setInterruptData,
}: UpdateLaunchpadCommandToolCallMessageProps) {
  // State to track current values for interactive inputs
  const [currentCommand, setCurrentCommand] = useState(
    launch_command.command || ""
  );
  const [currentArgs, setCurrentArgs] = useState(launch_command.args || "");

  // Update state when props change
  useEffect(() => {
    setCurrentCommand(launch_command.command || "");
  }, [launch_command.command]);

  useEffect(() => {
    setCurrentArgs(launch_command.args || "");
  }, [launch_command.args]);

  // Handle input changes to update interrupt data
  const handleCommandChange = (newCommand: string) => {
    setCurrentCommand(newCommand);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          launch_command: {
            ...prevData.payload.launch_command,
            command: newCommand,
          },
        },
      }));
    }
  };

  const handleArgsChange = (newArgs: string) => {
    setCurrentArgs(newArgs);

    if (setInterruptData) {
      setInterruptData((prevData: any) => ({
        ...prevData,
        payload: {
          ...prevData.payload,
          launch_command: {
            ...prevData.payload.launch_command,
            args: newArgs,
          },
        },
      }));
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Command:
            </span>
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => handleCommandChange(e.target.value)}
              className="px-3 py-2 text-sm font-mono bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              placeholder="Enter command..."
              disabled={!setInterruptData}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Args:
            </span>
            <input
              type="text"
              value={currentArgs}
              onChange={(e) => handleArgsChange(e.target.value)}
              className="px-3 py-2 text-sm font-mono bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              placeholder="Enter args..."
              disabled={!setInterruptData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
