"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DevboxDeleteCardProps {
  status: "complete" | "executing" | "inProgress";
  args: { devboxName: string };
  respond: (response: string) => void;
  result?: string;
}

export function DevboxDeleteCard({
  status,
  args,
  respond,
  result,
}: DevboxDeleteCardProps) {
  const handleConfirm = () => {
    respond("yes");
  };

  const handleCancel = () => {
    respond("no");
  };

  if (status === "complete") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">DevBox Deleted</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Success
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            DevBox "{args.devboxName}" has been successfully deleted.
          </p>
          {result && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (status === "executing") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <CardTitle className="text-lg">Deleting DevBox</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              In Progress
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Deleting DevBox "{args.devboxName}"...
          </p>
        </CardContent>
      </Card>
    );
  }

  // status === "inProgress" - waiting for user confirmation
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg">Confirm Deletion</CardTitle>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Confirmation Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm font-medium text-destructive mb-2">
            ⚠️ This action cannot be undone
          </p>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete DevBox "{args.devboxName}"? All data and configurations will be permanently lost.
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="min-w-[80px]"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}