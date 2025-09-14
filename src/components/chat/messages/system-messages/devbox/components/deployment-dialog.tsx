import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeploymentChart } from "../../components/deployment-chart";

interface DeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CustomResourceTarget;
  releaseTag: string;
}

export const DeploymentDialog: React.FC<DeploymentDialogProps> = ({
  open,
  onOpenChange,
  target,
  releaseTag,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Deploy {releaseTag} to...</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <DeploymentChart target={target} payload={{ tag: releaseTag }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
