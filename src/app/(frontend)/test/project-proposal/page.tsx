"use client";

import React, { useState } from "react";
import {
  ProjectProposalCard,
  ProjectProposalDisplay,
  ProjectProposalEdit
} from "@/components/chat/state-cards/project-proposal/";
import type { ProjectProposal } from "@/components/chat/state-cards/project-proposal/";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestProjectProposalPage() {
  const [demoMode, setDemoMode] = useState<"combined" | "individual">("combined");

  // Hardcoded test project proposal data
  const testProposal: ProjectProposal = {
    name: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with modern architecture, including user management, product catalog, payment processing, and order management.",
    resources: {
      devbox: [
        {
          name: "frontend-devbox",
          runtime: "Node.js",
          description: "Development environment for React frontend with Next.js framework",
          reliances: {
            database: ["user-db", "product-db"],
            bucket: ["product-images"]
          }
        },
        {
          name: "backend-devbox",
          runtime: "Python",
          description: "Backend API development environment with FastAPI and PostgreSQL",
          reliances: {
            database: ["user-db", "product-db", "order-db"],
            bucket: ["product-images", "user-uploads"]
          }
        }
      ],
      database: [
        {
          name: "user-db",
          type: "postgresql",
          description: "User management database storing customer profiles, authentication data, and preferences"
        },
        {
          name: "product-db",
          type: "postgresql",
          description: "Product catalog database containing items, categories, pricing, and inventory information"
        },
        {
          name: "order-db",
          type: "postgresql",
          description: "Order management database for tracking purchases, payments, and shipping details"
        }
      ],
      bucket: [
        {
          name: "product-images",
          policy: "PublicRead",
          description: "Object storage for product images, thumbnails, and media assets"
        },
        {
          name: "user-uploads",
          policy: "Private",
          description: "Secure storage for user-uploaded content and private documents"
        }
      ],
      app: [
        {
          name: "payment-service",
          image: "stripe/payment-processor:latest",
          description: "Microservice handling payment processing and integration with Stripe",
          reliances: {
            database: ["order-db"]
          }
        },
        {
          name: "notification-service",
          image: "sendgrid/email-service:v2.1",
          description: "Email notification service for order confirmations and user communications",
          reliances: {
            database: ["user-db", "order-db"]
          }
        }
      ]
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Project Proposal - New Structure</h1>
        <p className="text-muted-foreground">
          This page demonstrates the new three-file structure of Project Proposal components.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Demo Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => setDemoMode("combined")}
                variant={demoMode === "combined" ? "default" : "outline"}
              >
                Combined Component
              </Button>
              <Button
                onClick={() => setDemoMode("individual")}
                variant={demoMode === "individual" ? "default" : "outline"}
              >
                Individual Components
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {demoMode === "combined" ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Combined Component</h2>
            <p className="text-muted-foreground mb-6">
              This version combines display and edit modes in a single component with state management.
            </p>
            <ProjectProposalCard proposal={testProposal} initialMode="display" />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Individual Components</h2>
              <p className="text-muted-foreground mb-6">
                These are the separate display and edit components that can be used independently.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Display Component</h3>
              <p className="text-muted-foreground mb-6">
                Shows all resources in read-only mode without any edit buttons.
              </p>
              <ProjectProposalDisplay proposal={testProposal} />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Edit Component</h3>
              <p className="text-muted-foreground mb-6">
                Shows all resources in editable form - all resources can be edited at once.
              </p>
              <ProjectProposalEdit
                proposal={testProposal}
                onSave={(updatedProposal) => {
                  console.log("Saved:", updatedProposal);
                }}
                onCancel={() => {
                  console.log("Cancelled");
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
