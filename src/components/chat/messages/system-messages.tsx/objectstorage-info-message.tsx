import React from "react";
import { HardDrive, Globe, Shield, Copy, Wifi, WifiOff, Monitor, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ObjectStorageInfoMessageProps {
  payload: {
    name?: string;
    policy?: string;
    status?: string;
    createTime?: string;
    size?: string;
    objectCount?: number;
    isPublic?: boolean;
    staticHosting?: boolean;
  };
}

export const ObjectStorageInfoMessageCard: React.FC<ObjectStorageInfoMessageProps> = ({
  payload,
}) => {
  const {
    name = "Unknown Bucket",
    policy = "private",
    status = "Unknown",
    createTime,
    size = "0 B",
    objectCount = 0,
    isPublic = false,
    staticHosting = false
  } = payload;

  const getPolicyColor = (policy: string) => {
    switch (policy.toLowerCase()) {
      case "private":
        return "bg-red-100 text-red-800 border-red-200";
      case "publicread":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "publicreadwrite":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPolicyLabel = (policy: string) => {
    switch (policy.toLowerCase()) {
      case "private":
        return "Private";
      case "publicread":
        return "Public Read";
      case "publicreadwrite":
        return "Public Read/Write";
      default:
        return policy;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
      case "stopped":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (sizeInBytes: string) => {
    // Convert size string to human readable format
    const size = parseInt(sizeInBytes);
    if (isNaN(size)) return sizeInBytes;
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let sizeValue = size;
    
    while (sizeValue >= 1024 && unitIndex < units.length - 1) {
      sizeValue /= 1024;
      unitIndex++;
    }
    
    return `${sizeValue.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
        <h3 className="font-semibold text-orange-900 text-lg">{name}</h3>
        <Badge variant="outline" className={getStatusColor(status)}>
          {status}
        </Badge>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-orange-700">
            <span className="font-medium">Policy:</span>
          </p>
          <Badge variant="outline" className={getPolicyColor(policy)}>
            <Shield className="h-3 w-3 mr-1" />
            {getPolicyLabel(policy)}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-orange-700">
            <span className="font-medium">Created:</span> {formatDate(createTime)}
          </p>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="bg-orange-100 p-3 rounded-md">
        <h4 className="font-medium text-orange-800 mb-2">Storage Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">Total Size</p>
              <p className="text-xs text-orange-600">{formatSize(size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">Objects</p>
              <p className="text-xs text-orange-600">{objectCount} items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className="bg-orange-100 p-3 rounded-md">
        <h4 className="font-medium text-orange-800 mb-2">Access Control</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-orange-700">
                Public Access: {isPublic ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-orange-700">
                Static Hosting: {staticHosting ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          title="Copy bucket name"
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy Name
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          title="View bucket contents"
        >
          <Globe className="h-3 w-3 mr-1" />
          Browse
        </Button>
      </div>

      {/* Policy Description */}
      <div className="bg-white p-3 rounded-lg border border-orange-200">
        <h4 className="font-medium text-orange-800 mb-2">Policy Details</h4>
        <div className="text-sm text-orange-700">
          {policy === "private" && (
            <p>This bucket is private. Only authorized users can access objects.</p>
          )}
          {policy === "publicread" && (
            <p>This bucket allows public read access. Anyone can view objects but only authorized users can modify them.</p>
          )}
          {policy === "publicreadwrite" && (
            <p>This bucket allows public read and write access. Anyone can view and modify objects.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button className="flex-1" variant="outline" size="sm">
          <Monitor className="w-4 h-4 mr-2" />
          Monitor
        </Button>
        <Button className="flex-1" variant="outline" size="sm">
          <FolderOpen className="w-4 h-4 mr-2" />
          Files
        </Button>
      </div>
    </div>
  );
};

export default ObjectStorageInfoMessageCard;
