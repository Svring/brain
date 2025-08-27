"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import type { ProjectProposal, DevBox, Database, ObjectStorageBucket, App } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

// Import runtime options from devbox create message
import { runtimeOptions } from "@/components/chat/messages/system-messages.tsx/devbox/devbox-create-message";

// Import database type options from cluster create message
import { clusterTypeOptions } from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";

// Import policy options from object storage create message
import { bucketPolicyOptions } from "@/components/chat/messages/system-messages.tsx/objectstorage/objectstorage-create-message";

interface ProjectProposalEditProps {
  proposal: ProjectProposal;
  onSave: (updatedProposal: ProjectProposal) => void;
  onCancel: () => void;
  className?: string;
}

export function ProjectProposalEdit({
  proposal,
  onSave,
  onCancel,
  className = "",
}: ProjectProposalEditProps) {
  const [editData, setEditData] = useState<ProjectProposal>(proposal);

  const handleSave = () => {
    onSave(editData);
  };

  const updateDevBox = (index: number, updatedResource: DevBox) => {
    const newDevBoxes = [...(editData.resources.devbox || [])];
    newDevBoxes[index] = updatedResource;
    setEditData({
      ...editData,
      resources: {
        ...editData.resources,
        devbox: newDevBoxes,
      },
    });
  };

  const updateDatabase = (index: number, updatedResource: Database) => {
    const newDatabases = [...(editData.resources.database || [])];
    newDatabases[index] = updatedResource;
    setEditData({
      ...editData,
      resources: {
        ...editData.resources,
        database: newDatabases,
      },
    });
  };

  const updateBucket = (index: number, updatedResource: ObjectStorageBucket) => {
    const newBuckets = [...(editData.resources.bucket || [])];
    newBuckets[index] = updatedResource;
    setEditData({
      ...editData,
      resources: {
        ...editData.resources,
        bucket: newBuckets,
      },
    });
  };

  const updateApp = (index: number, updatedResource: App) => {
    const newApps = [...(editData.resources.app || [])];
    newApps[index] = updatedResource;
    setEditData({
      ...editData,
      resources: {
        ...editData.resources,
        app: newApps,
      },
    });
  };

  const devboxResources = editData.resources.devbox || [];
  const databaseResources = editData.resources.database || [];
  const bucketResources = editData.resources.bucket || [];
  const appResources = editData.resources.app || [];

  return (
    <Card className={`w-full max-w-3xl mx-auto ${className}`}>
      <CardContent className="space-y-6 pt-6">
        {/* Project Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Project Proposal</h2>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={onCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="mt-1"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editData.description || ""}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="mt-1"
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* DevBox Resources Section */}
        {devboxResources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Development Environments
              <Badge variant="secondary">{devboxResources.length}</Badge>
            </h3>
            <div className="space-y-4">
              {devboxResources.map((resource, index) => (
                <Card key={index} className="p-4 bg-blue-50 border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src="https://devbox.bja.sealos.run/logo.svg"
                        alt="DevBox Icon"
                        width={32}
                        height={32}
                        className="rounded-lg"
                      />
                      <span className="font-medium text-blue-800">DevBox #{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-blue-700">Name</label>
                        <Input
                          value={resource.name}
                          onChange={(e) =>
                            updateDevBox(index, { ...resource, name: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-blue-700">Runtime</label>
                        <Select
                          value={resource.runtime}
                          onValueChange={(value) =>
                            updateDevBox(index, { ...resource, runtime: value as any })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {runtimeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Description</label>
                      <Textarea
                        value={resource.description}
                        onChange={(e) =>
                          updateDevBox(index, { ...resource, description: e.target.value })
                        }
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Database Resources Section */}
        {databaseResources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Database Resources
              <Badge variant="secondary">{databaseResources.length}</Badge>
            </h3>
            <div className="space-y-4">
              {databaseResources.map((resource, index) => (
                <Card key={index} className="p-4 bg-green-50 border-green-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          CLUSTER_TYPE_ICON_MAP[
                            resource.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                          ] || "https://dbprovider.bja.sealos.run/logo.svg"
                        }
                        alt={`${resource.type} Icon`}
                        width={32}
                        height={32}
                        className="rounded-lg"
                      />
                      <span className="font-medium text-green-800">Database #{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-green-700">Name</label>
                        <Input
                          value={resource.name}
                          onChange={(e) =>
                            updateDatabase(index, { ...resource, name: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-green-700">Type</label>
                        <Select
                          value={resource.type}
                          onValueChange={(value) =>
                            updateDatabase(index, { ...resource, type: value as any })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {clusterTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-700">Description</label>
                      <Textarea
                        value={resource.description}
                        onChange={(e) =>
                          updateDatabase(index, { ...resource, description: e.target.value })
                        }
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Object Storage Resources Section */}
        {bucketResources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Object Storage Resources
              <Badge variant="secondary">{bucketResources.length}</Badge>
            </h3>
            <div className="space-y-4">
              {bucketResources.map((resource, index) => (
                <Card key={index} className="p-4 bg-orange-50 border-orange-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
                        alt="Object Storage Icon"
                        width={32}
                        height={32}
                        className="rounded-lg border"
                      />
                      <span className="font-medium text-orange-800">Bucket #{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-orange-700">Name</label>
                        <Input
                          value={resource.name}
                          onChange={(e) =>
                            updateBucket(index, { ...resource, name: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-orange-700">Policy</label>
                        <Select
                          value={resource.policy}
                          onValueChange={(value) =>
                            updateBucket(index, { ...resource, policy: value as any })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bucketPolicyOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-orange-700">Description</label>
                      <Textarea
                        value={resource.description}
                        onChange={(e) =>
                          updateBucket(index, { ...resource, description: e.target.value })
                        }
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* App Resources Section */}
        {appResources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Application Resources
              <Badge variant="secondary">{appResources.length}</Badge>
            </h3>
            <div className="space-y-4">
              {appResources.map((resource, index) => (
                <Card key={index} className="p-4 bg-purple-50 border-purple-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src="https://applaunchpad.bja.sealos.run/logo.svg"
                        alt="App Icon"
                        width={32}
                        height={32}
                        className="rounded-lg"
                      />
                      <span className="font-medium text-purple-800">App #{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-purple-700">Name</label>
                        <Input
                          value={resource.name}
                          onChange={(e) =>
                            updateApp(index, { ...resource, name: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-purple-700">Image</label>
                        <Input
                          value={resource.image}
                          onChange={(e) =>
                            updateApp(index, { ...resource, image: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-700">Description</label>
                      <Textarea
                        value={resource.description}
                        onChange={(e) =>
                          updateApp(index, { ...resource, description: e.target.value })
                        }
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
