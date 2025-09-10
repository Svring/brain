import React from "react";

interface CreatedAtProps {
  createdAt?: string;
}

export const CreatedAt: React.FC<CreatedAtProps> = ({ createdAt }) => {
  if (!createdAt) {
    return null;
  }

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Created At</h3>
      </div>
      <div className="p-2">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium truncate">{createdAt}</span>
        </div>
      </div>
    </div>
  );
};
