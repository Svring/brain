import { useState, useEffect } from "react";
import { SimplePortList } from "@/components/chat/state-cards/project-proposal/components/simple-port-list";

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

  // Handle ports change from SimplePortList
  const handlePortsChange = (newPorts: number[]) => {
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
        <SimplePortList
          ports={currentPorts}
          allowEditing={!!setInterruptData}
          onPortsChange={handlePortsChange}
        />
      </div>
    </div>
  );
}
