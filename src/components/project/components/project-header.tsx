"use client";

import { ArrowLeft, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MenuBar, MenuBarItem } from "./menu-bar";
import { getProjectDisplayNameFromResource } from "@/lib/project/project-method/project-utils";
import { getProjectOptions } from "@/lib/project/project-method/project-query";
import { useRenameProjectMutation } from "@/lib/project/project-method/project-mutation";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectHeaderProps {
  projectName: string;
}

export function ProjectHeader({ projectName }: ProjectHeaderProps) {
  const router = useRouter();
  const context = createK8sContext();
  const { data: project } = useQuery(getProjectOptions(context, projectName));
  const renameMutation = useRenameProjectMutation(context);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  if (!project) {
    return null;
  }

  const projectDisplayName = getProjectDisplayNameFromResource(project) || projectName;

  const handleEditClick = () => {
    setEditValue(projectDisplayName);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editValue.trim() && editValue !== projectDisplayName) {
      try {
        await renameMutation.mutateAsync({
          projectName,
          newDisplayName: editValue.trim(),
        });
      } catch (error) {
        console.error("Failed to rename project:", error);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue("");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const menuItemsLeft: MenuBarItem[] = [
    {
      icon: ArrowLeft,
      label: "Back to Home",
      onClick: () => router.push("/projects"),
      isToggle: false,
    },
  ];

  return (
    <div className="absolute top-2 left-2 z-20">
      <MenuBar activeIndex={null} items={menuItemsLeft}>
        <div className="flex items-center mx-2">
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-6 px-2 text-sm min-w-[120px]"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1">
              <span>{projectDisplayName}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                onClick={handleEditClick}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </MenuBar>
    </div>
  );
}
