"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { ChatInstanceProvider } from "@/components/provider/chat-instance-provider";
import AiChatbox from "./components/chatbox";
import { useChatClosing } from "./chat-closing-context";
import { useProjectState } from "@/contexts/project/project-context";
import { serializeResourceTarget, getProjectChatKey } from "@/contexts/chat/chat-machine";

function ChatManager() {
  const { chatInstances, focusedResourceTarget, topLayerType } = useChatState();
  const { setTopLayerType, closeChat, closeProjectChat } = useChatActions();
  const { closingChats, startClosing } = useChatClosing();
  const { selectedProject } = useProjectState();
  
  const [animatedChats, setAnimatedChats] = useState<Set<string>>(new Set());
  const previousChatsRef = useRef<Set<string>>(new Set());
  
  const [hasEverHadResourceChat, setHasEverHadResourceChat] = useState(false);
  const chatInstance = focusedResourceTarget ? chatInstances.get(focusedResourceTarget) : null;
  const isProjectChat = focusedResourceTarget ? focusedResourceTarget.startsWith("__project__") : false;
  const isResourceChat = chatInstance?.resourceTarget !== undefined;

  let projectChatKey: string | null = null;
  let projectChatInstance = null;
  if (selectedProject) {
    const possibleProjectKey = getProjectChatKey(selectedProject);
    const possibleProjectInstance = chatInstances.get(possibleProjectKey);
    if (possibleProjectInstance) {
      projectChatKey = possibleProjectKey;
      projectChatInstance = possibleProjectInstance;
    }
  }

  const hasProjectChatWhenOpeningResource = projectChatInstance !== null;

  const hasCascadingChats = isResourceChat && projectChatInstance;
  const currentChatKeys = new Set<string>();
  if (focusedResourceTarget) {
    if (isProjectChat) {
      currentChatKeys.add(focusedResourceTarget);
    } else if (isResourceChat) {
      if (projectChatKey) currentChatKeys.add(projectChatKey);
      currentChatKeys.add(focusedResourceTarget);
    }
  }
  
  useEffect(() => {
    const newChats = Array.from(currentChatKeys).filter(
      (key) => !previousChatsRef.current.has(key)
    );
    
    previousChatsRef.current = new Set(currentChatKeys);
    
    if (newChats.length > 0) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          setAnimatedChats((prev) => {
            const newSet = new Set(prev);
            newChats.forEach((key) => {
              if (key.startsWith("__project__")) {
                newSet.add(key);
              }
              else if (!hasEverHadResourceChat || hasProjectChatWhenOpeningResource) {
                newSet.add(key);
                if (!hasEverHadResourceChat) {
                  setHasEverHadResourceChat(true);
                }
              }
              else {
                newSet.add(key);
              }
            });
            return newSet;
          });
        }, 10);
      });
    }
    
    setAnimatedChats((prev) => {
      const filtered = new Set(
        Array.from(prev).filter((key) => currentChatKeys.has(key))
      );
      return filtered;
    });
  }, [focusedResourceTarget, projectChatKey, hasEverHadResourceChat, hasProjectChatWhenOpeningResource]);

  if (!focusedResourceTarget) {
    return null;
  }

  if (!chatInstance) {
    return null;
  }

  const handleProjectLayerClick = () => {
    if (hasCascadingChats) {
      if (chatInstance?.resourceTarget) {
        const resourceKey = serializeResourceTarget(chatInstance.resourceTarget);
        startClosing(resourceKey, () => {
          closeChat(chatInstance.resourceTarget!);
        });
      }
    }
  };

  const handleResourceLayerClick = () => {
    if (hasCascadingChats && chatInstance?.resourceTarget) {
      const resourceKey = serializeResourceTarget(chatInstance.resourceTarget);
      startClosing(resourceKey, () => {
        closeChat(chatInstance.resourceTarget!);
      });
    }
  };

  const projectZIndex = topLayerType === 'project' ? 50 : 40;
  const resourceZIndex = topLayerType === 'resource' ? 50 : 40;
  
  const currentProjectKey = isProjectChat ? focusedResourceTarget : projectChatKey;
  const isProjectAnimated = currentProjectKey ? animatedChats.has(currentProjectKey) : false;
  const isResourceAnimated = animatedChats.has(focusedResourceTarget);
  
  const isProjectClosing = currentProjectKey ? closingChats.has(currentProjectKey) : false;
  const isResourceClosing = closingChats.has(focusedResourceTarget);

  return (
    <div className="relative w-full h-full overflow-visible">
      {(isProjectChat || projectChatInstance) && (
        <div
          className={`absolute h-full ${hasCascadingChats ? 'cursor-pointer' : ''}`}
          onClick={handleProjectLayerClick}
          style={{
            width: hasCascadingChats 
              ? (topLayerType === 'project' ? "98%" : "100%")
              : "100%",
            right: 0,
            top: hasCascadingChats && topLayerType === 'project' ? "8px" : "0",
            height: hasCascadingChats && topLayerType === 'project' 
              ? "calc(100% - 1px)" 
              : "100%",
            transform: isProjectClosing
              ? "translateX(100%)"
              : !isProjectAnimated
              ? "translateX(100%)"
              : hasCascadingChats && topLayerType !== 'project'
              ? "translateX(-2px)"
              : "translateX(+2px)",
            zIndex: projectZIndex,
            opacity: hasCascadingChats && topLayerType !== 'project' ? 0.95 : 1,
            transition: "transform 900ms cubic-bezier(0.4, 0, 0.2, 1), width 500ms ease-in-out, top 500ms ease-in-out, height 500ms ease-in-out, opacity 500ms ease-in-out",
          }}
        >
          <div className={`w-full h-full rounded-xl border ${
            topLayerType === 'project' || !hasCascadingChats
              ? "border-gray-200/60"
              : "border-gray-200/60"
          } bg-background`}>
            {projectChatInstance && projectChatKey ? (
              <ChatInstanceProvider
                key={projectChatKey}
                projectName={projectChatInstance.projectName!}
              >
                <AiChatbox />
              </ChatInstanceProvider>
            ) : isProjectChat && chatInstance.projectName ? (
              <ChatInstanceProvider
                key={focusedResourceTarget}
                projectName={chatInstance.projectName}
              >
                <AiChatbox />
              </ChatInstanceProvider>
            ) : null}
          </div>
        </div>
      )}

      {isResourceChat && chatInstance.resourceTarget && (
        <div
          className={`absolute h-full ${hasCascadingChats ? 'cursor-pointer' : ''}`}
          onClick={handleResourceLayerClick}
          style={{
            width: hasCascadingChats
              ? (topLayerType === 'resource' ? "98%" : "100%")
              : "100%",
            right: 0,
            top: hasCascadingChats && topLayerType === 'resource' ? "8px" : "0",
            height: hasCascadingChats && topLayerType === 'resource'
              ? "calc(100% - 1px)"
              : "100%",
            transform: isResourceClosing
              ? "translateX(100%)"
              : !isResourceAnimated && (!hasEverHadResourceChat || hasProjectChatWhenOpeningResource)
              ? "translateX(100%)"
              : hasCascadingChats && topLayerType !== 'resource'
              ? "translateX(-2px)"
              : "translateX(+2px)",
            zIndex: resourceZIndex,
            opacity: hasCascadingChats && topLayerType !== 'resource' ? 0.95 : 1,
            transition: "transform 900ms cubic-bezier(0.4, 0, 0.2, 1), width 500ms ease-in-out, top 500ms ease-in-out, height 500ms ease-in-out, opacity 500ms ease-in-out",
          }}
        >
          <div className={`w-full h-full rounded-xl border ${
            topLayerType === 'resource' || !hasCascadingChats
              ? "border-gray-200/60"
              : "border-gray-200/60"
          } bg-background`}>
            <ChatInstanceProvider
              key={focusedResourceTarget}
              resourceTarget={chatInstance.resourceTarget}
            >
              <AiChatbox showResourceDetails={true} />
            </ChatInstanceProvider>
          </div>
        </div>
      )}
    </div>
  );
}

export { ChatManager };
export default ChatManager;