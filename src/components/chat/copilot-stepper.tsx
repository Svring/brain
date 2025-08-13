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
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

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
  // Find the last active or completed stage index, default to 0 if none
  const lastActiveOrCompletedIndex = React.useMemo(() => {
    // Find the last stage that is either active or completed
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stages[i].status === "active" || stages[i].status === "completed") {
        return i;
      }
    }
    return 0; // Default to first stage if none are active or completed
  }, [stages]);

  const [currentStageIndex, setCurrentStageIndex] = React.useState(lastActiveOrCompletedIndex);
  const [isOpen, setIsOpen] = React.useState(true);
  const currentStage = stages[currentStageIndex];

  // Update current stage when stages status changes
  React.useEffect(() => {
    setCurrentStageIndex(lastActiveOrCompletedIndex);
  }, [lastActiveOrCompletedIndex]);

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
    <div className="h-full bg-background-primary p-1 rounded-2xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="h-full">
        <Card className="w-full h-full flex flex-col bg-background-secondary shadow-lg">
          {/* <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer transition-colors flex-shrink-0">
              <CardTitle className="text-xl font-semibold flex items-center justify-between">
                {title}
                <span className="text-sm text-muted-foreground">
                  {isOpen ? "Click to collapse" : "Click to expand"}
                </span>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger> */}

          <CollapsibleContent className="flex-1 overflow-hidden">
            <CardContent className="px-4 h-full">
              <div className="flex flex-col lg:flex-row gap-3 h-full">
                {/* Left Side - Stages */}
                <div className="lg:w-1/4 border-r overflow-y-auto flex-shrink-0 pr-3">
                  <div className="space-y-1">
                    {stages.map((stage, index) => (
                      <motion.div
                        key={stage.id}
                        className={cn(
                          "p-2 rounded-md cursor-pointer relative",
                          index === currentStageIndex
                            ? "bg-background-secondary brightness-150"
                            : ""
                        )}
                        onClick={() => setCurrentStageIndex(index)}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">
                            {stage.status === "pending" && (
                              <span className="text-muted-foreground">{stage.title}</span>
                            )}
                            {stage.status === "active" && (
                              <TextShimmer className="text-sm font-medium" duration={1.5}>
                                {stage.title}
                              </TextShimmer>
                            )}
                            {stage.status === "completed" && (
                              <span className="text-foreground">{stage.title}</span>
                            )}
                          </h4>
                          {stage.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {stage.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Stage Details */}
                <div className="lg:w-3/4 overflow-y-auto flex-1 min-h-0 h-full pl-3">
                  {/* Stage Content */}
                  <div className="h-full">
                    {currentStage.details ? (
                      currentStage.details(
                        currentStage,
                        currentStageIndex,
                        inputData || ({} as T)
                      )
                    ) : currentStage.status === "active" ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <Spinner variant="bars" size={32} className="mb-4" />
                        <p>Processing...</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>No details available for this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

// Export individual components for more granular usage
export { CopilotStepper as Stepper };
