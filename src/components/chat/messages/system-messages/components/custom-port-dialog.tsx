import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCopy } from "@/hooks/use-copy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  RefreshCw,
  Edit,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { createRawDevboxClient } from "@/components/provider/trpc-provider";
import { useAuthState } from "@/contexts/auth/auth-context";
import { toast } from "sonner";

interface Port {
  number: number;
  privateAddress?: string;
  publicAddress?: string;
  protocol?: string;
  name?: string;
  serviceName?: string;
  host?: string;
}

interface DnsRecord {
  type: string;
  ttl: string;
  value: string;
}

interface CustomPortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPort: Port | null;
}

export function CustomPortDialog({
  open,
  onOpenChange,
  selectedPort,
}: CustomPortDialogProps) {
  const { copyToClipboard, isCopied } = useCopy();
  const { auth } = useAuthState();
  const [customDomain, setCustomDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([
    { type: "CNAME", ttl: "Auto", value: selectedPort?.publicAddress || "XXX" },
  ]);

  // Update DNS records when selectedPort changes
  useEffect(() => {
    if (selectedPort?.publicAddress) {
      setDnsRecords([
        { type: "CNAME", ttl: "Auto", value: selectedPort.publicAddress },
      ]);
    }
  }, [selectedPort]);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (!customDomain || !selectedPort?.publicAddress) {
      toast.error("Please enter a custom domain");
      return;
    }

    if (!auth) {
      toast.error("Authentication required");
      return;
    }

    try {
      const devboxClient = createRawDevboxClient(auth);
      const response = await devboxClient.authCname.query({
        publicDomain: selectedPort.publicAddress,
        customDomain: customDomain,
      });

      // Check response status
      if (response.code === 200) {
        toast.success("Domain authentication successful");
      } else if (response.code === 409) {
        toast.error(response.message || "Domain authentication failed");
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error: any) {
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
          <DialogTitle>Custom Domain - Port {selectedPort?.number}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Domain binding info */}
          <div className="text-sm text-muted-foreground flex-shrink-0">
            Domain binding for this availability zone requires Alibaba Cloud
            registration.
          </div>

          {/* Input with refresh and edit buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Input
              placeholder="Enter your custom domain..."
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
                  <Table className="flex-1">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/4">Type</TableHead>
                        <TableHead className="w-1/4">TTL</TableHead>
                        <TableHead className="w-1/2">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dnsRecords.map((record, index) => (
                        <TableRow key={index} className="h-auto">
                          <TableCell className="py-2">
                            <p className="text-sm">{record.type}</p>
                          </TableCell>
                          <TableCell className="py-2">
                            <p className="text-sm">{record.ttl}</p>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono truncate flex-1">{record.value}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 flex-shrink-0"
                                onClick={() =>
                                  copyToClipboard(record.value, `dns-${index}`)
                                }
                              >
                                {isCopied(`dns-${index}`) ? (
                                  <Check className="w-3 h-3 text-theme-green" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            {dnsRecords.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setDnsRecords(
                                    dnsRecords.filter((_, i) => i !== index)
                                  );
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Documentation link */}
              {/* <div className="flex justify-start pt-3">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Refer to the documentation
                </Button>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CustomPortDialog;
