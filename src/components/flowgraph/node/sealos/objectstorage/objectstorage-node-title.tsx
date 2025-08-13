"use client";

interface ObjectStorageNodeTitleProps {
  name: string;
}

export default function ObjectStorageNodeTitle({
  name,
}: ObjectStorageNodeTitleProps) {
  return (
    <div className="flex items-center gap-2 truncate font-medium">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground leading-none">
              Object Storage
            </span>
            <span className="text-lg font-bold text-foreground leading-tight w-full overflow-hidden text-ellipsis text-left">
              {name.length > 15 ? `${name.slice(0, 15)}...` : name}
            </span>
          </div>
        </span>
      </div>
    </div>
  );
}
