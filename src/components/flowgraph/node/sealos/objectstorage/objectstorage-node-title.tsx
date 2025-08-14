"use client";

import Image from "next/image";

interface ObjectStorageNodeTitleProps {
  name: string;
}

export default function ObjectStorageNodeTitle({
  name,
}: ObjectStorageNodeTitleProps) {
  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <Image
            src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
            alt="Object Storage Icon"
            width={24}
            height={24}
            className="rounded-lg border border-muted h-9 w-9 flex-shrink-0"
            priority
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              Object Storage
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate w-full">
              {name.length > 15 ? `${name.slice(0, 15)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
