import React from "react";

interface CreatedAtProps {
  createdAt?: string;
}

export const CreatedAt: React.FC<CreatedAtProps> = ({ createdAt }) => {
  if (!createdAt) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm text-muted-foreground">Created At</span>
      <span className="text-sm font-medium truncate">{createdAt}</span>
    </div>
  );
};
