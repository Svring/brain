"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ReactJson from "react-json-view";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import cardTypes from "../../action-cards/card-types";
import { MessageRendererProps } from "./types";

export function RenderResultMessage({ message }: MessageRendererProps) {
  const [isOpen, setIsOpen] = useState(true); // Default to open
  const isSuccess = !message.error;
  const resultData = message.result || message.error;
  const actionName = message.actionName;

  const dataToRender = useMemo(() => {
    if (resultData === null || typeof resultData === "undefined") {
      return { result: "No result" };
    }
    if (typeof resultData === "string") {
      try {
        return JSON.parse(resultData);
      } catch (e) {
        return { result: resultData };
      }
    }
    return resultData;
  }, [resultData]);

  // Check if we have a custom card component for this action
  const CardComponent = actionName ? cardTypes[actionName] : null;

  return (
    <div className="max-w-[85%] mr-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <Card className="bg-background border">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors bg-muted">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-foreground">
                  {isSuccess ? "Action Completed" : "Action Failed"}
                  {actionName && (
                    <span className="text-xs ml-2 opacity-70">
                      ({actionName})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="bg-background text-foreground px-0 pb-0">
              {/* Render custom card component if available, otherwise fall back to ReactJson */}
              {CardComponent && isSuccess ? (
                <CardComponent data={dataToRender} actionName={actionName} />
              ) : (
                <div className="bg-gray-900 p-2 rounded text-xs overflow-auto break-words">
                  <ReactJson
                    src={dataToRender}
                    theme="apathy"
                    name={false}
                    collapsed={1}
                    displayDataTypes={false}
                    displayObjectSize={true}
                    enableClipboard={true}
                    style={{
                      fontSize: "11px",
                      backgroundColor: "bg-background",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  />
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}