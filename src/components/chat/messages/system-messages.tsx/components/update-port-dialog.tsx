import React from "react";
import { Button } from "@/components/ui/button";
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
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Port Number</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-input rounded-md"
                defaultValue={selectedPort?.number}
                placeholder="Enter port number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Protocol</label>
              <select className="w-full px-3 py-2 border border-input rounded-md">
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log(`Updating port ${selectedPort?.number}`);
              onOpenChange(false);
            }}
          >
            Update Port
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdatePortDialog;
