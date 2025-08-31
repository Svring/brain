import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Port {
  number: number;
  privateAddress?: string;
  publicAddress?: string;
  protocol?: string;
  name?: string;
  serviceName?: string;
  host?: string;
}

interface UpdatePortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPort: Port | null;
}

export function UpdatePortDialog({
  open,
  onOpenChange,
  selectedPort,
}: UpdatePortDialogProps) {
  const [portConfig, setPortConfig] = useState({
    number: 8080,
    protocol: "TCP",
    appProtocol: undefined as string | undefined,
    public: false,
  });

  // Update form when selectedPort changes
  useEffect(() => {
    if (selectedPort) {
      setPortConfig({
        number: selectedPort.number,
        protocol: selectedPort.protocol || "TCP",
        appProtocol: undefined,
        public: !!selectedPort.publicAddress,
      });
    }
  }, [selectedPort]);

  // Handle unified protocol selection
  const handleProtocolSelection = (value: string) => {
    switch (value) {
      case "TCP":
        setPortConfig({ ...portConfig, protocol: "TCP", appProtocol: undefined });
        break;
      case "UDP":
        setPortConfig({ ...portConfig, protocol: "UDP", appProtocol: undefined });
        break;
      case "SCTP":
        setPortConfig({ ...portConfig, protocol: "SCTP", appProtocol: undefined });
        break;
      case "HTTP":
        setPortConfig({ ...portConfig, protocol: "TCP", appProtocol: "HTTP" });
        break;
      case "GRPC":
        setPortConfig({ ...portConfig, protocol: "TCP", appProtocol: "GRPC" });
        break;
      case "WS":
        setPortConfig({ ...portConfig, protocol: "TCP", appProtocol: "WS" });
        break;
    }
  };

  // Get display value for the unified select
  const getProtocolDisplayValue = () => {
    if (portConfig.appProtocol) {
      return portConfig.appProtocol;
    }
    return portConfig.protocol;
  };

  const handleUpdate = () => {
    console.log(`Updating port ${selectedPort?.number}`, portConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Port {selectedPort?.number}</DialogTitle>
          <DialogDescription>
            Update the configuration for port {selectedPort?.number}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="">
                <Input
                  type="number"
                  placeholder="Port number"
                  className="w-auto px-2 py-1 text-sm"
                  style={{
                    width: `${String(portConfig.number || "").length * 10 + 40}px`,
                  }}
                  value={portConfig.number}
                  onChange={(e) =>
                    setPortConfig({
                      ...portConfig,
                      number: parseInt(e.target.value) || 0,
                    })
                  }
                  inputMode="numeric"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Public access
                </span>
                <Checkbox
                  checked={portConfig.public}
                  onCheckedChange={(checked) =>
                    setPortConfig({ ...portConfig, public: checked as boolean })
                  }
                />
              </div>
              {portConfig.public && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Protocol</span>
                  <Select
                    value={getProtocolDisplayValue()}
                    onValueChange={handleProtocolSelection}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="SCTP">SCTP</SelectItem>
                      <SelectItem value="HTTP">HTTP</SelectItem>
                      <SelectItem value="GRPC">GRPC</SelectItem>
                      <SelectItem value="WS">WS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Update Port
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdatePortDialog;
