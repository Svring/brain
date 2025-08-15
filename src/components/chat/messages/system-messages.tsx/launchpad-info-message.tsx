import React from "react";
import { Rocket, Cpu, MemoryStick, Server, Globe, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LaunchpadPort {
  port: number;
  protocol: string;
  appProtocol?: string;
  exposesPublicDomain: boolean;
  publicAddress?: string;
}

interface LaunchpadResource {
  cpu: number;
  memory: number;
  replicas: number;
}

interface LaunchpadInfoMessageProps {
  payload: {
    name?: string;
    image?: string;
    status?: string;
    resource?: LaunchpadResource;
    ports?: LaunchpadPort[];
    createTime?: string;
    kind?: string;
  };
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  payload,
}) => {
  const {
    name = "Unknown App",
    image = "Unknown Image",
    status = "Unknown",
    resource,
    ports = [],
    createTime,
    kind = "deployment"
  } = payload;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "stopped":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
        <h3 className="font-semibold text-purple-900 text-lg">{name}</h3>
        <Badge variant="outline" className={getStatusColor(status)}>
          {status}
        </Badge>
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          {kind}
        </Badge>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-purple-700">
            <span className="font-medium">Image:</span> {image}
          </p>
          {createTime && (
            <p className="text-sm text-purple-700">
              <span className="font-medium">Created:</span> {formatDate(createTime)}
            </p>
          )}
        </div>
        {resource && (
          <div className="space-y-2">
            <p className="text-sm text-purple-700">
              <span className="font-medium">CPU:</span> {resource.cpu}m
            </p>
            <p className="text-sm text-purple-700">
              <span className="font-medium">Memory:</span> {resource.memory}MB
            </p>
          </div>
        )}
      </div>

      {/* Resource Configuration */}
      {resource && (
        <div className="bg-purple-100 p-3 rounded-md">
          <h4 className="font-medium text-purple-800 mb-2">Resource Configuration</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center text-center">
              <Cpu className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-xs text-purple-600">CPU</span>
              <span className="text-sm font-medium">{resource.cpu}m</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <MemoryStick className="w-4 h-4 text-green-600 mb-1" />
              <span className="text-xs text-purple-600">Memory</span>
              <span className="text-sm font-medium">{resource.memory}MB</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Server className="w-4 h-4 text-purple-600 mb-1" />
              <span className="text-xs text-purple-600">Replicas</span>
              <span className="text-sm font-medium">{resource.replicas}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ports Configuration */}
      {ports.length > 0 && (
        <div className="bg-purple-100 p-3 rounded-md">
          <h4 className="font-medium text-purple-800 mb-2">Ports ({ports.length})</h4>
          <div className="space-y-2">
            {ports.map((port, index) => (
              <div key={index} className="bg-white p-2 rounded border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-purple-600" />
                    <span className="text-sm font-medium">{port.port}</span>
                    <Badge variant="outline" className="text-xs">
                      {port.protocol}
                    </Badge>
                    {port.appProtocol && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                        {port.appProtocol}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {port.exposesPublicDomain && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                        Public
                      </Badge>
                    )}
                    {port.publicAddress && (
                      <span className="text-xs text-purple-600">
                        {port.publicAddress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchpadInfoMessageCard;
