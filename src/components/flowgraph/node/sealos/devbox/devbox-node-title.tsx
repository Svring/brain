"use client";

import React from "react";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";

interface DevboxNodeTitleProps {
  name: string;
  image: string;
  regionUrl: string;
}

export default function DevboxNodeTitle({
  name,
  image,
  regionUrl,
}: DevboxNodeTitleProps) {
  // console.log("image", transformDevboxImage(image).split("-").slice(0, -1).join("-"));
  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <img
            src={`https://devbox.${regionUrl}/images/runtime/${
              transformDevboxImage(image).split("-").slice(0, -1).join("-")
            }.svg`}
            alt="Devbox Icon"
            width={24}
            height={24}
            className="rounded-lg h-9 w-9 flex-shrink-0 p-1 bg-muted"
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              Devbox
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {name.length > 8 ? `${name.slice(0, 15)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
