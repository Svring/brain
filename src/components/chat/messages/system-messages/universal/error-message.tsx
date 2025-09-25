"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { openCostCenterApp } from "@/lib/auth/auth-utils";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  payload?: {
    type: string;
    error: string;
  };
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ payload }) => {
  if (!payload) {
    return (
      <div className="w-full">
        <div className="bg-border-destructive/20 rounded-lg p-2">
          <div className="bg-background-secondary rounded-lg p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-sm text-destructive font-medium">Error</p>
            </div>
            <div className="mt-1">
              <p className="text-sm text-foreground break-all">
                Unknown error occurred
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { type, error } = payload;

  // Check if error string contains 'group_balance_not_enough'
  const isBalanceError =
    type === "group_balance_not_enough" ||
    (error && error.includes("group_balance_not_enough"));

  // Handle specific error types with custom messages
  const getDisplayError = (errorType: string, errorStr: string) => {
    if (isBalanceError) {
      return "Please top up your balance before proceeding.";
    }

    // For other types, try to parse the error string if it contains JSON
    const parseError = (errorStr: string) => {
      try {
        // Look for JSON pattern in the error string
        const jsonMatch = errorStr.match(/\{.*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          return parsed;
        }
      } catch {
        // If parsing fails, return the original string
      }
      return errorStr;
    };

    const parsedError = parseError(errorStr);
    return typeof parsedError === "string"
      ? parsedError
      : parsedError?.error?.message || JSON.stringify(parsedError);
  };

  const displayError = getDisplayError(type, error);
  const displayType = isBalanceError ? "Balance run up" : `Error (${type})`;
  const showCostCenterButton = isBalanceError;

  return (
    <div className="w-full">
      <div className="bg-destructive rounded-lg p-0.5">
        <div className="bg-background-secondary rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-2">
            {isBalanceError && (
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            )}
            <p className="text-destructive font-medium">{displayType}</p>
          </div>
          <div className="mt-1">
            <p className="text-sm text-foreground break-all">{displayError}</p>
          </div>
          {showCostCenterButton && (
            <div className="mt-3">
              <Button
                size="sm"
                variant={"outline"}
                onClick={openCostCenterApp}
                className="w-full"
              >
                Open Cost Center
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
