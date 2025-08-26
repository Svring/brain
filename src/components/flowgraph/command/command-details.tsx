"use client";

import { ArrowLeft, Play, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DevboxCreateMessage from "@/components/chat/messages/system-messages.tsx/devbox/devbox-create-message";
import ClusterCreateMessage from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";
import LaunchpadCreateMessage from "@/components/chat/messages/system-messages.tsx/launchpad/launchpad-create-message";
import ObjectStorageCreateMessage from "@/components/chat/messages/system-messages.tsx/objectstorage/objectstorage-create-message";
import DisplayEnvPanel from "@/components/project/display-env/display-env-panel";
import { AddResourcePreview } from "./command-panel-add-resource";
import { ManageStatusDetail } from "./manage-status-detail";

interface CommandDetailsProps {
  command: string;
  onExecute: (value: string) => void;
  onBack: () => void;
}

interface CommandInfo {
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  examples?: string[];
}

const commandInfoMap: Record<string, CommandInfo> = {
  "add-devbox": {
    title: "Add Devbox",
    description: "Add a development environment container to your project. Provides a complete development environment with tools and dependencies.",
    category: "Resource Management",
    icon: <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white">📦</div>,
    parameters: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "The name of the devbox"
      },
      {
        name: "template",
        type: "enum",
        required: false,
        description: "Development template (node, python, go, etc.)"
      }
    ],
    examples: [
      "add-devbox --name dev-env --template node",
      "add-devbox --name backend-dev --template python"
    ]
  },
  "add-database": {
    title: "Add Database",
    description: "Add a new database resource to your project. This will create a database node in your flowgraph.",
    category: "Resource Management",
    icon: <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white">DB</div>,
    parameters: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "The name of the database"
      },
      {
        name: "type",
        type: "enum",
        required: true,
        description: "Database type (PostgreSQL, MySQL, MongoDB)"
      },
      {
        name: "version",
        type: "string",
        required: false,
        description: "Database version"
      }
    ],
    examples: [
      "add-database --name mydb --type postgresql",
      "add-database --name cache --type redis --version 7.0"
    ]
  },
  "add-server": {
    title: "Add Server",
    description: "Add a new server resource to your project. This will create a server node in your flowgraph.",
    category: "Resource Management",
    icon: <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white">S</div>,
    parameters: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "The name of the server"
      },
      {
        name: "type",
        type: "enum",
        required: true,
        description: "Server type (Web, API, Worker)"
      },
      {
        name: "port",
        type: "number",
        required: false,
        description: "Server port"
      }
    ],
    examples: [
      "add-server --name api-server --type api --port 3000",
      "add-server --name worker --type worker"
    ]
  },
  "add-app-launchpad": {
    title: "Add App Launchpad",
    description: "Add an application deployment platform to your project. Provides easy deployment and scaling for your applications.",
    category: "Resource Management",
    icon: <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white">🚀</div>,
    parameters: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "The name of the app launchpad"
      },
      {
        name: "type",
        type: "enum",
        required: true,
        description: "Application type (web, api, frontend)"
      },
      {
        name: "replicas",
        type: "number",
        required: false,
        description: "Number of replicas"
      }
    ],
    examples: [
      "add-app-launchpad --name my-app --type web",
      "add-app-launchpad --name api --type api --replicas 3"
    ]
  },
  "add-object-storage": {
    title: "Add Object Storage",
    description: "Add cloud object storage service to your project. Provides scalable storage for files, images, and data.",
    category: "Resource Management",
    icon: <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center text-white">💾</div>,
    parameters: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "The name of the storage bucket"
      },
      {
        name: "public",
        type: "boolean",
        required: false,
        description: "Whether the storage is public"
      },
      {
        name: "region",
        type: "string",
        required: false,
        description: "Storage region"
      }
    ],
    examples: [
      "add-object-storage --name assets --public true",
      "add-object-storage --name private-data --region us-east-1"
    ]
  },
  "remove-selected": {
    title: "Remove Selected Resources",
    description: "Remove the currently selected resources from your project. This action cannot be undone.",
    category: "Resource Management",
    icon: <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center text-white">R</div>,
    parameters: [
      {
        name: "confirm",
        type: "boolean",
        required: true,
        description: "Confirm the removal"
      }
    ],
    examples: [
      "remove-selected --confirm true"
    ]
  },
  "search-by-name": {
    title: "Search by Name",
    description: "Search for nodes in your flowgraph by their name. Supports partial matching and wildcards.",
    category: "Search",
    icon: <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white">🔍</div>,
    parameters: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Search query"
      },
      {
        name: "case-sensitive",
        type: "boolean",
        required: false,
        description: "Case sensitive search"
      }
    ],
    examples: [
      "search-by-name --query database",
      "search-by-name --query api --case-sensitive true"
    ]
  },
  "create-empty-project": {
    title: "Create Empty Project",
    description: "Create a new empty project with no initial resources. You can add resources later.",
    category: "Project Management",
    icon: <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center text-white">P</div>,
    parameters: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Project name"
      },
      {
        name: "description",
        type: "string",
        required: false,
        description: "Project description"
      }
    ],
    examples: [
      "create-empty-project --name my-project",
      "create-empty-project --name api-service --description \"API service project\""
    ]
  }
};

export function CommandDetails({ command, onExecute, onBack }: CommandDetailsProps) {
  // Check if this is one of the four resource creation commands
  const isResourceCreationCommand = [
    "add-devbox",
    "add-database", 
    "add-app-launchpad",
    "add-object-storage"
  ].includes(command);

  // Check if this is a project command
  const isProjectCommand = [
    "display-env",
    "manage-status",
    "add-new"
  ].includes(command);

  // If it's a resource creation command, show the appropriate create component
  if (isResourceCreationCommand) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white">
                {command === "add-devbox" && "📦"}
                {command === "add-database" && "DB"}
                {command === "add-app-launchpad" && "🚀"}
                {command === "add-object-storage" && "💾"}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {command === "add-devbox" && "Create Devbox"}
                  {command === "add-database" && "Create Database"}
                  {command === "add-app-launchpad" && "Create App Launchpad"}
                  {command === "add-object-storage" && "Create Object Storage"}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  Resource Creation
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {command === "add-devbox" && <DevboxCreateMessage />}
          {command === "add-database" && <ClusterCreateMessage />}
          {command === "add-app-launchpad" && <LaunchpadCreateMessage />}
          {command === "add-object-storage" && <ObjectStorageCreateMessage payload={{}} />}
        </div>
      </div>
    );
  }

  // If it's a project command, show the appropriate component
  if (isProjectCommand) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white">
                {command === "display-env" && "👁️"}
                {command === "manage-status" && "⚙️"}
                {command === "add-new" && "➕"}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {command === "display-env" && "Display Environment"}
                  {command === "manage-status" && "Manage Status"}
                  {command === "add-new" && "Add New Resource"}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  Project Management
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {command === "display-env" && <DisplayEnvPanel />}
          {command === "manage-status" && <ManageStatusDetail />}
          {command === "add-new" && <AddResourcePreview onSelect={onExecute} autoFocus={true} />}
        </div>
      </div>
    );
  }

  // For other commands, show the standard details view
  const commandInfo = commandInfoMap[command] || {
    title: command.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    description: "Command details not available.",
    category: "Unknown",
    icon: <div className="w-8 h-8 rounded bg-gray-500 flex items-center justify-center text-white">?</div>
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {commandInfo.icon}
            <div>
              <h2 className="text-lg font-semibold">{commandInfo.title}</h2>
              <Badge variant="secondary" className="text-xs">
                {commandInfo.category}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Description
          </h3>
          <p className="text-sm">{commandInfo.description}</p>
        </div>

        <Separator />

        {/* Parameters */}
        {commandInfo.parameters && commandInfo.parameters.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Parameters
            </h3>
            <div className="space-y-3">
              {commandInfo.parameters.map((param, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm">{param.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {param.type}
                      </Badge>
                      {param.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {commandInfo.examples && commandInfo.examples.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Examples</h3>
            <div className="space-y-2">
              {commandInfo.examples.map((example, index) => (
                <div key={index} className="bg-muted rounded-lg p-3">
                  <code className="text-sm font-mono">{example}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button 
          onClick={() => onExecute(command)}
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          Execute Command
        </Button>
      </div>
    </div>
  );
}
