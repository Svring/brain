"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DEVBOX_IDE } from "@/lib/sealos/devbox/devbox-constant-a";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeSshConnectionUri } from "@/lib/sealos/devbox/devbox-method/devbox-utils";
import { getDevboxSshInfo } from "@/lib/sealos/devbox/devbox-method/devbox-query";

interface DevboxNodeIdeProps {
  context: any;
  devboxContext: any;
  target: CustomResourceTarget;
  data: any;
  className?: string;
}

export default function DevboxNodeIde({
  context,
  devboxContext,
  target,
  data,
  className = "",
}: DevboxNodeIdeProps) {
  const [selectedIde, setSelectedIde] = useState<string>("vscode");

  return (
    <div
      className={`flex items-center border border-border rounded-lg overflow-hidden ${className}`}
    >
      {/* IDE Icon - Click to open IDE */}
      <button
        onClick={async (e) => {
          e.stopPropagation();
          try {
            // Fetch SSH info dynamically
            const token = await getDevboxSshInfo(devboxContext, target);

            if (data.ssh) {
              const sshUri = composeSshConnectionUri(
                selectedIde,
                context,
                data.ssh,
                data.name,
                token
              );
              window.open(sshUri, "_blank");
            }
          } catch (error) {
            console.error("Failed to get SSH info:", error);
          }
        }}
        className="p-1 hover:bg-muted transition-colors flex items-center"
      >
        <Image
          src={`https://devbox.${context.regionUrl}/images/ide/${selectedIde}.svg`}
          alt={`${selectedIde} icon`}
          width={16}
          height={16}
          className="h-5 w-6"
        />
      </button>

      {/* Separator */}
      <div className="w-px h-4 bg-border" />

      {/* Dropdown Arrow */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 hover:bg-muted transition-colors flex items-center"
          >
            <ChevronDown className="h-5 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="rounded-xl bg-background-secondary"
          align="start"
        >
          {DEVBOX_IDE.map((ide) => (
            <DropdownMenuItem
              key={ide}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIde(ide);
              }}
              className={selectedIde === ide ? "bg-muted" : ""}
            >
              <Image
                src={`https://devbox.${context.regionUrl}/images/ide/${ide}.svg`}
                alt={`${ide} icon`}
                width={16}
                height={16}
                className="mr-2 h-4 w-4"
              />
              <span className="capitalize">{ide}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
