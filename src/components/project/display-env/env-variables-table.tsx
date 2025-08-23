import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EnvVariable {
  key: string;
  value: string;
  type?: string;
}

interface EnvVariablesTableProps {
  envVars: EnvVariable[];
  resourceName: string;
}

export function EnvVariablesTable({
  envVars,
  resourceName,
}: EnvVariablesTableProps) {
  const { copyToClipboard, isCopied } = useCopy();

  if (!envVars || envVars.length === 0) {
    return (
      <p className="text-muted-foreground">
        No environment variables configured for this resource.
      </p>
    );
  }

  return (
    <div className="space-y-3 border border-dashed rounded-lg">
      <div className="w-full overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Variable Name</TableHead>
              <TableHead className="w-2/3">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {envVars.map((envVar, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{envVar.key}</TableCell>
                <TableCell className="max-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate" title={envVar.value || "-"}>
                      {envVar.value || "-"}
                    </span>
                    {envVar.value && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            envVar.value!,
                            `env-${resourceName}-${envVar.key}`
                          )
                        }
                      >
                        {isCopied(`env-${resourceName}-${envVar.key}`) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
