import React from "react";
import { Input } from "@/components/ui/input";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseSystemMessage from "../components/base-system-message";

interface CustomDomainMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function CustomDomainMessage({
  target,
}: CustomDomainMessageProps) {
  return (
    <BaseSystemMessage target={target}>
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">
            Your Domain
          </h3>
          <Input placeholder="Enter your custom domain..." className="w-full" />
        </div>
      </div>
    </BaseSystemMessage>
  );
}
