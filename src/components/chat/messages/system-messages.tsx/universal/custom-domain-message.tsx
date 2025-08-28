import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseActionMessage from "../components/base-action-message";
import { FileText, Search, RefreshCw, Edit, ExternalLink } from "lucide-react";

interface CustomDomainMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function CustomDomainMessage({
  target,
}: CustomDomainMessageProps) {
  const handleFilingEntry = () => {
    // Handle filing entry action
    console.log("Filing Entry clicked");
  };

  const handleFilingQuery = () => {
    // Handle filing query action
    console.log("Filing Query clicked");
  };

  const handleRefresh = () => {
    // Handle refresh action
    console.log("Refresh clicked");
  };

  const handleEdit = () => {
    // Handle edit action
    console.log("Edit clicked");
  };

  const handleReferToDocumentation = () => {
    // Handle documentation action
    console.log("Refer to documentation clicked");
  };

  const actions = [
    {
      icon: ExternalLink,
      label: "Refer to the documentation",
      onClick: handleReferToDocumentation,
    },
  ];

  return (
    <BaseActionMessage
      headerTitle={{
        icon: FileText,
        name: "Your Domain",
      }}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Domain binding info */}
        <div className="text-sm text-muted-foreground">
          Domain binding for this availability zone requires Alibaba Cloud registration.
        </div>

        {/* Filing buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleFilingEntry} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Filing Entry
          </Button>
          <Button variant="outline" size="sm" onClick={handleFilingQuery} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Filing Query
          </Button>
        </div>

        {/* Input with refresh and edit buttons */}
        <div className="space-y-3">
          <Input placeholder="Enter your custom domain..." className="w-full" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* DNS Records section */}
        <Card className="border border-border-primary">
          <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-medium text-foreground">DNS Records</h4>
            <p className="text-sm text-muted-foreground">
              The DNS records at your provider must match the following records to verify and connect your domain to Sealos.
            </p>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Type</TableHead>
                  <TableHead className="w-1/3">TTL</TableHead>
                  <TableHead className="w-1/3">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>CNAME</TableCell>
                  <TableCell>Auto</TableCell>
                  <TableCell className="font-mono text-xs">XXX</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </BaseActionMessage>
  );
}
