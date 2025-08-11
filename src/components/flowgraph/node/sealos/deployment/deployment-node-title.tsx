"use client";

import React from "react";
import Image from "next/image";

interface DeploymentNodeTitleProps {
  name: string;
}

export default function DeploymentNodeTitle({ name }: DeploymentNodeTitleProps) {
  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <Image
            src="https://applaunchpad.bja.sealos.run/logo.svg"
            alt="Deploy Icon"
            width={24}
            height={24}
            className="rounded-lg border border-muted h-9 w-9 flex-shrink-0"
            priority
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              App Launchpad
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