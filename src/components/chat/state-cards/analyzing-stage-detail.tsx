"use client";

import { ProjectBrief } from "@/contexts/langgraph/langgraph-schema";
import { Spinner } from "@/components/ui/spinner";

interface AnalyzingStageDetailProps {
  analyzingData: ProjectBrief;
  analyzingStatus: "pending" | "active" | "completed";
}

export function AnalyzingStageDetail({ analyzingData, analyzingStatus }: AnalyzingStageDetailProps) {
  return (
    <div className="rounded-lg">
      {analyzingData.briefs.length > 0 ? (
        <div>
          <h4 className="font-medium mb-1">Analysis Results:</h4>
          <ul className="space-y-0.5">
            {analyzingData.briefs.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : analyzingStatus === "active" ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner variant="bars" size={32} className="mb-4" />
          <p className="text-sm text-muted-foreground">Analyzing project requirements...</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No analysis data available
        </p>
      )}
    </div>
  );
}
