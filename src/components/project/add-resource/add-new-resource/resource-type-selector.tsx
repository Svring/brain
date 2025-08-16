"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Database, 
  Rocket, 
  HardDrive,
  Plus,
  Loader2
} from "lucide-react";

interface ResourceTypeSelectorProps {
  onSelectResource: (resourceType: string) => void;
  isCreating?: boolean;
}

export default function ResourceTypeSelector({ onSelectResource, isCreating = false }: ResourceTypeSelectorProps) {
  const resourceTypes = [
    {
      id: "devbox",
      title: "Devbox",
      description: "Create a cloud development environment with pre-configured tools and runtime",
      icon: Terminal,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100",
    },
    {
      id: "database",
      title: "Database",
      description: "Deploy managed database services like PostgreSQL, MongoDB, MySQL, and more",
      icon: Database,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100",
    },
    {
      id: "applaunchpad",
      title: "App Launchpad",
      description: "Deploy containerized applications with auto-scaling and load balancing",
      icon: Rocket,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:bg-purple-100",
    },
    {
      id: "objectstoragebucket",
      title: "Object Storage",
      description: "Create scalable object storage buckets for files, backups, and static assets",
      icon: HardDrive,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-100",
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Resources</h3>
        <p className="text-sm text-muted-foreground">
          Choose a resource type to create and add to your project
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceTypes.map((resource) => {
          const IconComponent = resource.icon;
          
          return (
            <Card 
              key={resource.id}
              className={`transition-all duration-200 ${resource.borderColor} ${
                isCreating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer ' + resource.hoverColor + ' hover:shadow-md'
              }`}
              onClick={() => !isCreating && onSelectResource(resource.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${resource.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${resource.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 p-1 h-8 w-8"
                    disabled={isCreating}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCreating) {
                        onSelectResource(resource.id);
                      }
                    }}
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
