import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

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
  const [customDomain, setCustomDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([
    { type: "CNAME", ttl: "Auto", value: "XXX" },
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Custom Settings - Port {selectedPort?.number}
          </DialogTitle>
          <DialogDescription>
            Configure custom domain and DNS settings for port{" "}
            {selectedPort?.number}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Domain binding info */}
          <div className="text-sm text-muted-foreground">
            Domain binding for this availability zone requires Alibaba Cloud
            registration.
          </div>

          {/* Filing buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Filing Entry
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Filing Query
            </Button>
          </div>

          {/* Input with refresh and edit buttons */}
          <div className="space-y-3">
            <Input
              placeholder="Enter your custom domain..."
              className="w-full"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* DNS Records section */}
          <Card className="border border-border-primary">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  DNS Records
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDnsRecords([
                      ...dnsRecords,
                      { type: "CNAME", ttl: "Auto", value: "" },
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                The DNS records at your provider must match the following
                records to verify and connect your domain to Sealos.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Type</TableHead>
                    <TableHead className="w-1/4">TTL</TableHead>
                    <TableHead className="w-1/2">Value</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dnsRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={record.type}
                          onValueChange={(value) => {
                            const newRecords = [...dnsRecords];
                            newRecords[index].type = value;
                            setDnsRecords(newRecords);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="AAAA">AAAA</SelectItem>
                            <SelectItem value="CNAME">CNAME</SelectItem>
                            <SelectItem value="MX">MX</SelectItem>
                            <SelectItem value="TXT">TXT</SelectItem>
                            <SelectItem value="SRV">SRV</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={record.ttl}
                          onChange={(e) => {
                            const newRecords = [...dnsRecords];
                            newRecords[index].ttl = e.target.value;
                            setDnsRecords(newRecords);
                          }}
                          placeholder="TTL"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={record.value}
                          onChange={(e) => {
                            const newRecords = [...dnsRecords];
                            newRecords[index].value = e.target.value;
                            setDnsRecords(newRecords);
                          }}
                          placeholder="Value"
                          className="font-mono text-xs"
                        />
                      </TableCell>
                      <TableCell>
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
            </CardContent>
          </Card>

          {/* Documentation link */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Refer to the documentation
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log(
                `Applying custom settings for port ${selectedPort?.number}`,
                {
                  customDomain,
                  dnsRecords,
                }
              );
              onOpenChange(false);
            }}
          >
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CustomPortDialog;
