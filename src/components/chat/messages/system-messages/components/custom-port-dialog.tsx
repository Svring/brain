import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCopy } from "@/hooks/use-copy";
// Table components removed - will use custom implementation
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Copy, Check } from "lucide-react";
import { createRawDevboxClient } from "@/components/provider/trpc-provider";
import { useAuthState } from "@/contexts/auth/auth-context";
import { toast } from "sonner";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface Port {
  number: number;
  privateAddress?: string;
  publicAddress?: string;
  protocol?: string;
  name?: string;
  serviceName?: string;
  host?: string;
}

interface CustomPortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPort: Port | null;
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export function CustomPortDialog({
  open,
  onOpenChange,
  selectedPort,
  target,
}: CustomPortDialogProps) {
  const { copyToClipboard, isCopied } = useCopy();
  const { auth } = useAuthState();
  const { resource } = useResourceStatus(target);
  const [customDomain, setCustomDomain] = useState("");

  // Get the complete port object with portName from the resource
  const completePort = resource && selectedPort 
    ? (resource as DevboxObject)?.ports?.find(port => port.number === selectedPort.number)
    : null;

  // Simplified DNS record (always CNAME with Auto TTL)
  const dnsRecord = {
    type: "CNAME",
    ttl: "Auto",
    value: selectedPort?.publicAddress || "XXX"
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    // Console log the portName and customDomain
    console.log("=== Refresh Button Clicked ===");
    console.log("Port Name:", completePort?.portName);
    console.log("Custom Domain:", customDomain);
    console.log("===============================");

    if (!selectedPort?.publicAddress) {
      toast.error("No public address found for this port");
      return;
    }

    if (!auth) {
      toast.error("Authentication required");
      return;
    }

    if (!completePort?.portName) {
      toast.error("Port name not found");
      return;
    }

    try {
      const devboxClient = createRawDevboxClient(auth);
      const isEmptyDomain = !customDomain || customDomain.trim() === "";
      
      // Get all ports and prepare update data
      const allPorts = (resource as DevboxObject)?.ports || [];
      const updatedPorts = allPorts
        .filter(port => port.portName)
        .map(port => {
          if (port.number === selectedPort.number) {
            return {
              portName: port.portName!,
              customDomain: isEmptyDomain ? "" : customDomain
            };
          }
          return { portName: port.portName! };
        });

      const updateData = { ports: updatedPorts };
      
      if (isEmptyDomain) {
        // Directly remove custom domain
        console.log("Removing custom domain for port:", completePort?.portName);
        console.log("Updating devbox to remove custom domain:", updateData);
        
        const updateResponse = await devboxClient.update.mutate({
          name: target.name!,
          ...updateData
        });
        
        console.log("Update response:", updateResponse);
        toast.success("Custom domain removed successfully");
      } else {
        // Authenticate and update custom domain
        const authResponse = await devboxClient.authCname.query({
          publicDomain: selectedPort.publicAddress,
          customDomain: customDomain,
        });

        if (authResponse.code === 200) {
          toast.success("Domain authentication successful");
          
          console.log("Updating devbox with:", updateData);
          
          const updateResponse = await devboxClient.update.mutate({
            name: target.name!,
            ...updateData
          });
          
          console.log("Update response:", updateResponse);
          toast.success("Custom domain updated successfully");
        } else {
          toast.error(authResponse.message || "Domain authentication failed");
          return;
        }
      }
      
      // Close dialog after successful update
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Error in handleRefresh:", error);
      
      // Handle TRPC errors
      if (error?.data?.httpStatus === 409) {
        toast.error(error.message || "Domain authentication failed");
      } else if (error?.data?.httpStatus === 200) {
        toast.success("Domain authentication successful");
      } else {
        toast.error(error?.message || "Failed to authenticate domain");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            Custom Domain - Port {selectedPort?.number}
            {completePort?.portName && ` (${completePort.portName})`}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Domain binding info */}
          <div className="text-sm text-muted-foreground flex-shrink-0">
            Domain binding for this availability zone requires Alibaba Cloud
            registration.
          </div>

          {/* Input with refresh button */}
          <div className="flex gap-2 flex-shrink-0">
            <Input
              placeholder="Enter your custom domain (leave empty to remove)"
              className="flex-1"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
            />
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* DNS Records section */}
          <Card className="border border-border-primary flex-1 flex flex-col min-h-0">
            <CardContent className="flex-1 flex flex-col space-y-3 min-h-0">
              <div className="flex items-center flex-shrink-0">
                <h4 className="text-sm font-medium text-foreground">
                  DNS Records
                </h4>
              </div>
              <p className="text-sm text-muted-foreground flex-shrink-0">
                The DNS records at your provider must match the following
                records to verify and connect your domain to Sealos.
              </p>

              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="flex-1 border rounded-md">
                    {/* Table Header */}
                    <div className="flex border-b bg-muted/50">
                      <div className="w-1/4 px-4 py-2 text-sm font-medium">Type</div>
                      <div className="w-1/4 px-4 py-2 text-sm font-medium">TTL</div>
                      <div className="w-1/2 px-4 py-2 text-sm font-medium">Value</div>
                    </div>
                    {/* Table Body */}
                    <div className="flex">
                      <div className="w-1/4 px-4 py-2">
                        <p className="text-sm">{dnsRecord.type}</p>
                      </div>
                      <div className="w-1/4 px-4 py-2">
                        <p className="text-sm">{dnsRecord.ttl}</p>
                      </div>
                      <div className="w-1/2 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono truncate flex-1">
                            {dnsRecord.value}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => copyToClipboard(dnsRecord.value, "dns-record")}
                          >
                            {isCopied("dns-record") ? (
                              <Check className="w-3 h-3 text-theme-green" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CustomPortDialog;