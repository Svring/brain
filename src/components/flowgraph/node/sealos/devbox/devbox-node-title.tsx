"use client";

import React from "react";
import Image from "next/image";

interface DevboxNodeTitleProps {
  name: string;
  image: string;
  regionUrl: string;
}

export default function DevboxNodeTitle({ name, image, regionUrl }: DevboxNodeTitleProps) {
  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <Image
            src={`https://devbox.${regionUrl}/images/runtime/${
              image.split("-")[0]
            }.svg`}
            alt="Devbox Icon"
            width={24}
            height={24}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              Devbox
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {name.length > 8 ? `${name.slice(0, 8)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}