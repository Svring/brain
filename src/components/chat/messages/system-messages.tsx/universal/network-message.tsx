import React, { useState } from "react";
import { Globe, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DevboxObject,
  DevboxPort,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import BaseActionMessage from "../components/base-action-message";
import { PortDisplayTable } from "../components/port-display-table";
import { Checkbox } from "@/components/ui/checkbox";

interface NetworkMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NetworkMessage({ target }: NetworkMessageProps) {
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const [showPortForm, setShowPortForm] = useState(false);
  const [newPort, setNewPort] = useState({
    number: 8080,
    protocol: "TCP",
    appProtocol: undefined as string | undefined,
    public: false,
  });

  const { resource } = useResourceStatus(target);

  const ports = (resource as DevboxObject)?.ports || [];

  const handleAddPort = () => {
    setShowPortForm(true);
  };

  const handleSavePort = () => {
    // Only support launchpad resources (deployment/statefulset) for now
    if (
      target.type === "builtin" &&
      ["deployment", "statefulset"].includes(target.resourceType.toLowerCase())
    ) {
      appendSystemMessage({ type: "launchpad.updatePort", target });
    }
    setShowPortForm(false);
    setNewPort({
      number: 8080,
      protocol: "TCP",
      appProtocol: undefined,
      public: false,
    });
  };

  const handleCancelPort = () => {
    setShowPortForm(false);
    setNewPort({
      number: 8080,
      protocol: "TCP",
      appProtocol: undefined,
      public: false,
    });
  };

  // Handle unified protocol selection
  const handleProtocolSelection = (value: string) => {
    switch (value) {
      case "TCP":
        setNewPort({ ...newPort, protocol: "TCP", appProtocol: undefined });
        break;
      case "UDP":
        setNewPort({ ...newPort, protocol: "UDP", appProtocol: undefined });
        break;
      case "SCTP":
        setNewPort({ ...newPort, protocol: "SCTP", appProtocol: undefined });
        break;
      case "HTTP":
        setNewPort({ ...newPort, protocol: "TCP", appProtocol: "HTTP" });
        break;
      case "GRPC":
        setNewPort({ ...newPort, protocol: "TCP", appProtocol: "GRPC" });
        break;
      case "WS":
        setNewPort({ ...newPort, protocol: "TCP", appProtocol: "WS" });
        break;
    }
  };

  // Get display value for the unified select
  const getProtocolDisplayValue = () => {
    if (newPort.appProtocol) {
      return newPort.appProtocol;
    }
    return newPort.protocol;
  };

  if (!resource || !ports || ports.length === 0) {
    return null;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Globe,
        name: "Network Ports",
      }}
    >
      <div className="space-y-3">
        <PortDisplayTable ports={ports} />

        {!showPortForm ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPort}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Port
          </Button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg">
            <div className="flex-1 flex items-center gap-3">
              <div className="">
                <Input
                  type="number"
                  placeholder="Port number"
                  className="w-auto px-2 py-1 text-sm"
                  style={{
                    width: `${String(newPort.number || "").length * 10 + 40}px`,
                  }}
                  value={newPort.number}
                  onChange={(e) =>
                    setNewPort({
                      ...newPort,
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
                  checked={newPort.public}
                  onCheckedChange={(checked) =>
                    setNewPort({ ...newPort, public: checked as boolean })
                  }
                />
              </div>
              {newPort.public && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Protocol
                  </span>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSavePort}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelPort}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </BaseActionMessage>
  );
}
