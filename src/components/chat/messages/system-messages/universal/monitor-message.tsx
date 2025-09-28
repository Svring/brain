import React from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { MonitorChart } from "@/components/chat/messages/system-messages/components/monitor-chart";

interface MonitorMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
  payload?: any;
}

const MonitorMessage: React.FC<MonitorMessageProps> = ({ target, payload }) => {
  return <MonitorChart target={target} payload={payload} />;
};

export default MonitorMessage;
