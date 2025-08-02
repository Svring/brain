"use client";

import { Badge } from "@/components/ui/badge";

interface ObjectStoragePolicyBadgeProps {
  policy: string;
}

export default function ObjectStoragePolicyBadge({ policy }: ObjectStoragePolicyBadgeProps) {
  const getPolicyBadgeColor = (policy: string) => {
    switch (policy?.toLowerCase()) {
      case 'private':
        return 'bg-theme-blue/20 text-theme-blue border-theme-blue';
      case 'publicread':
        return 'bg-theme-green/20 text-theme-green border-theme-green';
      case 'publicreadwrite':
        return 'bg-theme-purple/20 text-theme-purple border-theme-purple';
      default:
        return 'bg-theme-gray/20 text-theme-gray border-theme-gray';
    }
  };

  const getPolicyDisplayName = (policy: string) => {
    switch (policy?.toLowerCase()) {
      case 'private':
        return 'Private';
      case 'publicread':
        return 'Public Read';
      case 'publicreadwrite':
        return 'Read/Write';
      default:
        return policy;
    }
  };

  return (
    <Badge className={`text-xs px-2 py-1 border ${getPolicyBadgeColor(policy)}`}>
      {getPolicyDisplayName(policy)}
    </Badge>
  );
}