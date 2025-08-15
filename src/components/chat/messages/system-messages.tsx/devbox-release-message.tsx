import React from "react";
import { ArrowBigUpDash, Tag, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Release {
  id: string;
  tag: string;
  createTime: string;
  status?: {
    value: string;
    label: string;
  };
}

interface DevboxReleaseMessageProps {
  payload: {
    releases?: Release[];
    devboxName?: string;
  };
}

export const DevboxReleaseMessageCard: React.FC<DevboxReleaseMessageProps> = ({
  payload,
}) => {
  const { releases = [], devboxName = "Unknown Devbox" } = payload;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "running":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <h3 className="font-semibold text-blue-900 text-lg">Releases for {devboxName}</h3>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {releases.length} release{releases.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Releases List */}
      {releases.length > 0 ? (
        <div className="space-y-3">
          {releases.map((release) => (
            <div key={release.id} className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-blue-900">
                      {release.tag}
                    </span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {formatDate(release.createTime)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {release.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status.value)}`}>
                      {release.status.label || release.status.value}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    title="Deploy release"
                    disabled={release.status?.value === "Pending"}
                  >
                    <ArrowBigUpDash className="h-3 w-3 mr-1" />
                    Deploy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                    title="Delete release"
                    disabled={release.status?.value === "Pending"}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ArrowBigUpDash className="h-8 w-8 text-blue-400 mb-2" />
          <div className="text-sm text-blue-600">No releases available</div>
          <div className="text-xs text-blue-500 mt-1">Create your first release to get started</div>
        </div>
      )}
    </div>
  );
};

export default DevboxReleaseMessageCard;
