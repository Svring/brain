import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface SystemMessage {
  type: string;
  target: CustomResourceTarget | BuiltinResourceTarget;
  payload?: any;
}
