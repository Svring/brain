"use client";

import type { AiState } from "@/contexts/ai/ai-machine";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Database,
  Globe,
  Key,
  Folder,
  FileText,
  ChevronDown,
  ChevronRight,
  GitBranch,
  MousePointer,
  Circle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ReactJson from "react-json-view";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface StateCardProps {
  state: AiState;
  className?: string;
}

export function StateCard({ state, className }: StateCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasApiKey = !!state.api_key;
  const hasProjects = state.project_context?.homepageData?.projects?.length > 0;
  const hasCurrentProject = !!state.project_context?.flowGraphData?.project;
  const hasResources =
    state.project_context?.flowGraphData?.resources?.length > 0;

  // Flow context state
  const hasNodes = state.flow_context?.nodes?.length > 0;
  const hasEdges = state.flow_context?.edges?.length > 0;
  const hasSelectedNode = !!state.flow_context?.selectedNode;
  const hasSelectedEdge = !!state.flow_context?.selectedEdge;
  const isFlowInitialized = !!state.flow_context?.isInitialized;

  const [showProjectsJson, setShowProjectsJson] = useState(false);
  const [showCurrentProjectJson, setShowCurrentProjectJson] = useState(false);
  const [showResourcesJson, setShowResourcesJson] = useState(false);
  const [showNodesJson, setShowNodesJson] = useState(false);
  const [showEdgesJson, setShowEdgesJson] = useState(false);
  const [showSelectedNodeJson, setShowSelectedNodeJson] = useState(false);
  const [showSelectedEdgeJson, setShowSelectedEdgeJson] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full", className)}
    >
      <Card>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI State</span>
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
          <CardContent className="space-y-4 pt-0 p-6">
            {/* Model & System Configuration */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Model Configuration
              </h4>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <Badge variant="secondary">{state.model}</Badge>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground flex-shrink-0">
                    System Prompt:
                  </span>
                  <span className="text-right text-xs font-mono bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                    {state.system_prompt}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Connection Configuration */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Connection
              </h4>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Base URL:</span>
                  </div>
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded max-w-[150px] truncate">
                    {state.base_url || "(not set)"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">API Key:</span>
                  </div>
                  <Badge variant={hasApiKey ? "default" : "destructive"}>
                    {hasApiKey ? "Configured" : "Missing"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Context */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Project Context
              </h4>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {/* Projects */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Projects:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasProjects ? "default" : "secondary"}>
                        {hasProjects
                          ? `${state.project_context.homepageData.projects.length} loaded`
                          : "None"}
                      </Badge>
                      {hasProjects && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowProjectsJson(!showProjectsJson)}
                        >
                          {showProjectsJson ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showProjectsJson && hasProjects && (
                    <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                      <ReactJson
                        src={state.project_context.homepageData.projects}
                        theme="summerfruit"
                        name={false}
                        // collapsed={1}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Current Project */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Current Project:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={hasCurrentProject ? "default" : "secondary"}
                      >
                        {hasCurrentProject ? "Active" : "None"}
                      </Badge>
                      {hasCurrentProject && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            setShowCurrentProjectJson(!showCurrentProjectJson)
                          }
                        >
                          {showCurrentProjectJson ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showCurrentProjectJson && hasCurrentProject && (
                    <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                      {state.project_context.flowGraphData.project}
                    </div>
                  )}
                </div>

                {/* Resources */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Resources:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasResources ? "default" : "secondary"}>
                        {hasResources
                          ? `${state.project_context.flowGraphData.resources.length} loaded`
                          : "None"}
                      </Badge>
                      {hasResources && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            setShowResourcesJson(!showResourcesJson)
                          }
                        >
                          {showResourcesJson ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showResourcesJson && hasResources && (
                    <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                      <ReactJson
                        src={state.project_context.flowGraphData.resources}
                        theme="summerfruit"
                        name={false}
                        collapsed={1}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Flow Context */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Flow Context
              </h4>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {/* Flow Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status:</span>
                  </div>
                  <Badge variant={isFlowInitialized ? "default" : "secondary"}>
                    {isFlowInitialized ? "Initialized" : "Not Initialized"}
                  </Badge>
                </div>

                {/* Nodes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Nodes:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasNodes ? "default" : "secondary"}>
                        {hasNodes
                          ? `${state.flow_context.nodes.length} nodes`
                          : "None"}
                      </Badge>
                      {hasNodes && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowNodesJson(!showNodesJson)}
                        >
                          {showNodesJson ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showNodesJson && hasNodes && (
                    <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                      <ReactJson
                        src={state.flow_context.nodes}
                        theme="summerfruit"
                        name={false}
                        collapsed={1}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Edges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Edges:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasEdges ? "default" : "secondary"}>
                        {hasEdges
                          ? `${state.flow_context.edges.length} edges`
                          : "None"}
                      </Badge>
                      {hasEdges && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowEdgesJson(!showEdgesJson)}
                        >
                          {showEdgesJson ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showEdgesJson && hasEdges && (
                    <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                      <ReactJson
                        src={state.flow_context.edges}
                        theme="summerfruit"
                        name={false}
                        collapsed={1}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Selected Node */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Selected Node:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={hasSelectedNode ? "default" : "secondary"}
                      >
                        {hasSelectedNode ? "Selected" : "None"}
                      </Badge>
                      {hasSelectedNode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            setShowSelectedNodeJson(!showSelectedNodeJson)
                          }
                        >
                          {showSelectedNodeJson ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showSelectedNodeJson && hasSelectedNode && (
                    <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                      <ReactJson
                        src={state.flow_context.selectedNode}
                        theme="summerfruit"
                        name={false}
                        collapsed={1}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Selected Edge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Selected Edge:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={hasSelectedEdge ? "default" : "secondary"}
                      >
                        {hasSelectedEdge ? "Selected" : "None"}
                      </Badge>
                      {hasSelectedEdge && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            setShowSelectedEdgeJson(!showSelectedEdgeJson)
                          }
                        >
                          {showSelectedEdgeJson ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showSelectedEdgeJson && hasSelectedEdge && (
                    <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                      <ReactJson
                        src={state.flow_context.selectedEdge}
                        theme="summerfruit"
                        name={false}
                        collapsed={1}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
