import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CustomDomainMessageProps {
  domain?: string;
}

export const CustomDomainMessage: React.FC<CustomDomainMessageProps> = ({
  domain = '',
}) => {
  return (
    <div className="w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Domain binding for this availability zone requires Alibaba Cloud registration.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your domain"
              value={domain}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DNS Records Section */}
      <div className="border-2 border-dashed rounded-lg p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">DNS Record</h3>
          <p className="text-sm text-muted-foreground">
            The DNS records at your provider must match the following records to verify and connect your domain to Sealos.
          </p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>TTL</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>CNAME</TableCell>
              <TableCell>3600</TableCell>
              <TableCell className="font-mono text-sm">sealos.example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-4">
          <Button variant="outline" className="w-full">
            Refer to the documentation
          </Button>
        </div>
      </div>
    </div>
  );
};
