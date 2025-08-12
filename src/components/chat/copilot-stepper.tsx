"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface StepperStage<T = any> {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "completed";
  details?: (
    stage: StepperStage<T>,
    stageIndex: number,
    data: T
  ) => React.ReactNode;
  data?: T;
}

export interface StepperProps<T = any> {
  stages: StepperStage<T>[];
  inputData?: T;
  title?: string;
}

export function CopilotStepper<T = any>({
  stages,
  inputData,
  title = "Progress Stepper",
}: StepperProps<T>) {
  const [currentStageIndex, setCurrentStageIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(true);
  const currentStage = stages[currentStageIndex];

  const getStageIcon = (stage: StepperStage<T>, index: number) => {
    if (stage.status === "completed") {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (index === currentStageIndex) {
      return <Circle className="h-4 w-4 text-blue-600 fill-current" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-2xl">
            <CardTitle className="text-xl font-semibold flex items-center justify-between">
              {title}
              <span className="text-sm text-muted-foreground">
                {isOpen ? "Click to collapse" : "Click to expand"}
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side - Stages */}
              <div className="lg:w-1/3 p-6 border-r">
                <div className="space-y-3">
                  {stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                        index === currentStageIndex
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"
                          : "border-gray-300"
                      )}
                      onClick={() => setCurrentStageIndex(index)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getStageIcon(stage, index)}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={cn(
                            "text-sm font-medium",
                            index === currentStageIndex
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-gray-900 dark:text-gray-100"
                          )}
                        >
                          {stage.title}
                        </h4>
                        {stage.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stage.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Stage Details */}
              <div className="lg:w-2/3 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {currentStage.title}
                    </h3>
                    {currentStage.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {currentStage.description}
                      </p>
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="min-h-[200px]">
                    {currentStage.details ? (
                      currentStage.details(
                        currentStage,
                        currentStageIndex,
                        inputData || ({} as T)
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>No details available for this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Export individual components for more granular usage
export { CopilotStepper as Stepper };
