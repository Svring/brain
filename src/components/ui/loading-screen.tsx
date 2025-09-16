"use client";

import { Spinner } from "@/components/ui/spinner";

interface LoadingScreenProps {
  text: string;
  variant?: "bars" | "dots" | "pulse";
  size?: number;
  className?: string;
}

export function LoadingScreen({
  text,
  size = 24,
  className = "",
}: LoadingScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center h-full w-full space-y-4 ${className}`}
    >
      <Spinner size={size} />
      {/* <p className="text-muted-foreground text-center">{text}</p> */}
    </div>
  );
}
