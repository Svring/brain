"use client";

import React from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { LogChart } from "../components/log-chart";

interface ResourceLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
  payload?: any;
}

const LogMessage: React.FC<ResourceLogProps> = ({ target, payload }) => {
  return <LogChart logsData={payload} />;
};

export default LogMessage;
