"use client";

import React, { useState } from "react";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import type { ProjectProposal } from "@/components/chat/state-cards/project-proposal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestProjectProposalPage() {
  const [demoMode, setDemoMode] = useState<"readonly" | "editable">("editable");

  // Hardcoded test project proposal data
  const testProposal: ProjectProposal = {
    name: "E-Commerce Platform",
    resources: {
      devbox: [
        {
          name: "frontend-devbox",
          runtime: "Node.js",
          reliances: {
            database: ["user-db", "product-db"],
            bucket: ["product-images"],
          },
        },
        {
          name: "backend-devbox",
          runtime: "Python",
          reliances: {
            database: ["user-db", "product-db", "order-db"],
            bucket: ["product-images", "user-uploads"],
          },
        },
      ],
      database: [
        {
          name: "user-db",
          type: "postgresql",
        },
        {
          name: "product-db",
          type: "postgresql",
        },
        {
          name: "order-db",
          type: "postgresql",
        },
      ],
      bucket: [
        {
          name: "product-images",
          policy: "PublicRead",
        },
        {
          name: "user-uploads",
          policy: "Private",
        },
      ],
      app: [
        {
          name: "payment-service",
          image: "stripe/payment-processor:latest",
          reliances: {
            database: ["order-db"],
          },
        },
        {
          name: "notification-service",
          image: "sendgrid/email-service:v2.1",
          reliances: {
            database: ["user-db", "order-db"],
          },
        },
      ],
    },
  };

  const handleSave = (updatedProposal: ProjectProposal) => {
    console.log("Saved:", updatedProposal);
    // In a real app, you would save this to your backend
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Test Project Proposal - Unified Component
        </h1>
        <p className="text-muted-foreground">
          This page demonstrates the unified ProjectProposalCard component that
          handles both display and edit modes in a single component.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Demo Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => setDemoMode("editable")}
                variant={demoMode === "editable" ? "default" : "outline"}
              >
                Editable Mode
              </Button>
              <Button
                onClick={() => setDemoMode("readonly")}
                variant={demoMode === "readonly" ? "default" : "outline"}
              >
                Read-Only Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {demoMode === "editable" ? "Editable Mode" : "Read-Only Mode"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {demoMode === "editable"
              ? "This version allows editing of the project proposal with save functionality."
              : "This version shows the project proposal in read-only mode without edit buttons."}
          </p>
          <ProjectProposalCard proposal={testProposal} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
