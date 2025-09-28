"use client";

import React from "react";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { StatusChart } from "../components/status-chart";

interface AnalyzeStatusMessageProps {
  target: ResourceTarget;
  payload?: any;
}

export default function AnalyzeStatusMessage({
  target,
  payload,
}: AnalyzeStatusMessageProps) {
  return <StatusChart statusData={payload} />;
}
