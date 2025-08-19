"use client";

import React from "react";
import { ProjectProposalCard, type ProjectProposal } from "./project-proposal";

// Example data matching the provided JSON structure
const exampleProjectProposal: ProjectProposal = {
  name: "Blog Site",
  description: "A platform for publishing articles where users can create, edit, and manage blog posts. Supports user accounts and organizes content for readers.",
  resources: {
    devboxes: [
      {
        name: "Main DevBox",
        runtime: "Node.js",
        description: "Handles the blog site functionalities including serving content and managing users."
      }
    ],
    databases: [
      {
        name: "Blog Database",
        type: "postgresql",
        description: "Stores user accounts, blog posts, and site settings."
      }
    ],
    buckets: [
      {
        name: "Media Storage",
        policy: "PublicRead",
        description: "Stores images and media files for blog posts."
      }
    ]
  }
};

// More complex example with multiple resources
const complexExample: ProjectProposal = {
  name: "E-commerce Platform",
  description: "A comprehensive e-commerce solution with user management, product catalog, payment processing, and analytics.",
  resources: {
    devboxes: [
      {
        name: "Frontend DevBox",
        runtime: "React",
        description: "Handles the user interface and client-side functionality."
      },
      {
        name: "Backend DevBox",
        runtime: "Node.js",
        description: "Manages API endpoints, business logic, and data processing."
      },
      {
        name: "Admin Panel",
        runtime: "Next.js",
        description: "Provides administrative interface for managing products and orders."
      }
    ],
    databases: [
      {
        name: "User Database",
        type: "postgresql",
        description: "Stores user accounts, profiles, and authentication data."
      },
      {
        name: "Product Database",
        type: "mongodb",
        description: "Manages product catalog, categories, and inventory."
      },
      {
        name: "Cache Database",
        type: "redis",
        description: "Provides fast caching for frequently accessed data."
      }
    ],
    buckets: [
      {
        name: "Product Images",
        policy: "PublicRead",
        description: "Stores product images and media files."
      },
      {
        name: "User Uploads",
        policy: "Private",
        description: "Secure storage for user-uploaded content."
      },
      {
        name: "Backup Storage",
        policy: "Private",
        description: "Backup storage for system data and configurations."
      }
    ]
  }
};

export function ProjectProposalDemo() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Project Proposal Example</h1>
        <p className="text-muted-foreground">
          Example of how the ProjectProposalCard component displays project configuration
        </p>
      </div>

      <ProjectProposalCard proposal={exampleProjectProposal} />
    </div>
  );
}

// Export the example data for use in other components
export { exampleProjectProposal, complexExample };
