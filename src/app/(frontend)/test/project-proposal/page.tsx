"use client";

import React from "react";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

export default function TestProjectProposalPage() {
  // Hardcoded test project proposal data
  const testProposal: ProjectProposal = {
    name: "E-Commerce Platform",
    resources: {
      devbox: [
        {
          name: "frontend-devbox",
          runtime: "Node.js",
          ports: [
            { number: 3000, publicAccess: true },
            { number: 3001, publicAccess: false },
          ],
          reliances: {
            database: ["user-db", "product-db"],
            bucket: ["product-images"],
          },
        },
        {
          name: "backend-devbox",
          runtime: "Python",
          ports: [
            { number: 8000, publicAccess: true },
            { number: 8001, publicAccess: false },
          ],
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
          ports: [
            { number: 8080, publicAccess: false },
            { number: 8443, publicAccess: true },
          ],
          env: [
            { name: "STRIPE_SECRET_KEY", value: "sk_test_..." },
            { name: "DATABASE_URL", value: "postgresql://..." },
            { name: "NODE_ENV", value: "production" },
          ],
          reliances: {
            database: ["order-db"],
          },
        },
        {
          name: "notification-service",
          image: "sendgrid/email-service:v2.1",
          ports: [{ number: 3000, publicAccess: true }],
          env: [
            { name: "SENDGRID_API_KEY", value: "SG...." },
            { name: "FROM_EMAIL", value: "noreply@example.com" },
            { name: "DATABASE_URL", value: "postgresql://..." },
          ],
          reliances: {
            database: ["user-db", "order-db"],
          },
        },
      ],
    },
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ProjectProposalCard proposal={testProposal} />
    </div>
  );
}
