import React from "react";
import { Box, Activity, Clock, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Pod {
  name: string;
  status: string;
  age?: string;
  nodeName?: string;
  ip?: string;
  restarts?: number;
  cpu?: number;
  memory?: number;
}

interface PodMessageProps {
  payload: {
    pods?: Pod[];
    resourceName?: string;
    resourceType?: string;
  };
}

export const PodMessageCard: React.FC<PodMessageProps> = ({
  payload,
}) => {
  const { pods = [], resourceName = "Unknown Resource", resourceType = "Unknown" } = payload;

  const getPodStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "stopped":
      case "shutdown":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pending":
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "deleting":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOverallStatusColor = () => {
    if (pods.length === 0) {
      return "text-gray-500";
    }

    const hasError = pods.some((pod) => pod.status.toLowerCase() === "error" || pod.status.toLowerCase() === "failed");
    if (hasError) {
      return "text-red-500";
    }

    const allRunning = pods.every((pod) => pod.status.toLowerCase() === "running");
    if (allRunning) {
      return "text-green-500";
    }

    return "text-yellow-500";
  };

  const formatAge = (age?: string) => {
    if (!age) return "Unknown";
    // Convert age string to human readable format
    return age;
  };

  const formatResource = (value?: number) => {
    if (value === undefined || value === null) return "N/A";
    return value.toString();
  };

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
        <h3 className="font-semibold text-indigo-900 text-lg">Pods for {resourceName}</h3>
        <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
          {resourceType}
        </Badge>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {pods.length} pod{pods.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Overall Status */}
      <div className="flex items-center gap-2">
        <Box className={`h-4 w-4 ${getOverallStatusColor()}`} />
        <span className="text-sm text-indigo-700">
          Overall Status: {
            pods.length === 0 ? "No pods" :
            pods.every(pod => pod.status.toLowerCase() === "running") ? "All Running" :
            pods.some(pod => pod.status.toLowerCase() === "error" || pod.status.toLowerCase() === "failed") ? "Has Errors" :
            "Mixed Status"
          }
        </span>
      </div>

      {/* Pods List */}
      {pods.length > 0 ? (
        <div className="space-y-3">
          {pods.map((pod, index) => (
            <div key={pod.name || index} className="bg-white p-3 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">
                    {pod.name}
                  </span>
                </div>
                <Badge variant="outline" className={getPodStatusColor(pod.status)}>
                  {pod.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-indigo-700">
                <div className="space-y-1">
                  {pod.age && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Age: {formatAge(pod.age)}</span>
                    </div>
                  )}
                  {pod.nodeName && (
                    <div className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      <span>Node: {pod.nodeName}</span>
                    </div>
                  )}
                  {pod.ip && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>IP: {pod.ip}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  {pod.restarts !== undefined && (
                    <div>
                      <span className="font-medium">Restarts:</span> {pod.restarts}
                    </div>
                  )}
                  {pod.cpu !== undefined && (
                    <div>
                      <span className="font-medium">CPU:</span> {formatResource(pod.cpu)}m
                    </div>
                  )}
                  {pod.memory !== undefined && (
                    <div>
                      <span className="font-medium">Memory:</span> {formatResource(pod.memory)}Mi
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Box className="h-8 w-8 text-indigo-400 mb-2" />
          <div className="text-sm text-indigo-600">No pods available</div>
          <div className="text-xs text-indigo-500 mt-1">Pods will appear here when the resource is running</div>
        </div>
      )}

      {/* Status Legend */}
      <div className="bg-white p-3 rounded-lg border border-indigo-200">
        <h4 className="font-medium text-indigo-800 mb-2 text-sm">Status Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Pending/Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Error/Failed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Stopped</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodMessageCard;
