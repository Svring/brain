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
import BaseSystemMessage from "../components/base-system-message";
import { PortDisplayTable } from "../components/port-display-table";
import { Checkbox } from "@/components/ui/checkbox";
import { NetworkChart } from "../components/network-chart";

interface NetworkMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NetworkMessage({ target }: NetworkMessageProps) {
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
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
      ["deployment", "statefulset"].includes(target.resourceType?.toLowerCase() || "")
    ) {
      appendSystemMessageMutation.mutate({ type: "launchpad.updatePort", target });
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
    <BaseSystemMessage
      headerTitle={{
        icon: Globe,
        name: "Network Ports",
      }}
    >
      <NetworkChart target={target} />
    </BaseSystemMessage>
  );
}
