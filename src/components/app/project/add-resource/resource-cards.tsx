"use client";

import { motion } from "framer-motion";
import { ChevronLeft, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Draggable } from "@/components/flow/dnd/draggable";
import { DragOverlay, useDndMonitor } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  convertToResourceTarget,
  getResourceConfigFromKind,
} from "@/lib/k8s/k8s-method/k8s-utils";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import Image from "next/image";
import {
  CLUSTER_TYPE_ICON_MAP,
  CLUSTER_DEFINITION_LABEL_KEY,
} from "@/lib/sealos/cluster/cluster-constant";

interface ResourceCardsProps {
  resources: (AnyKubernetesResource & { resourceType: string })[];
}

// Resource icon mapping based on kind/type
const RESOURCE_ICON_MAP: Record<string, string> = {
  devbox: "https://devbox.bja.sealos.run/logo.svg",
  deployment: "https://applaunchpad.bja.sealos.run/logo.svg",
  objectstoragebucket:
    "https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg",
  cluster: "", // Will be determined dynamically from cluster type
  service: "/icons/kubernetes/service.svg", // Fallback
  ingress: "/icons/kubernetes/ingress.svg", // Fallback
  statefulset: "https://applaunchpad.bja.sealos.run/logo.svg",
  pvc: "/icons/kubernetes/pvc.svg", // Fallback
};

// Animation variants with proper typing
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
};

const logoVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

function getResourceIcon(
  resource: AnyKubernetesResource & { resourceType: string }
) {
  const { kind, resourceType } = resource;

  // For clusters, get the specific icon based on cluster type
  if (
    kind === "Cluster" &&
    resource.metadata?.labels?.[CLUSTER_DEFINITION_LABEL_KEY]
  ) {
    const clusterType = resource.metadata.labels[CLUSTER_DEFINITION_LABEL_KEY];
    return CLUSTER_TYPE_ICON_MAP[clusterType] || RESOURCE_ICON_MAP.cluster;
  }

  return (
    RESOURCE_ICON_MAP[resourceType] ||
    RESOURCE_ICON_MAP[kind.toLowerCase()] ||
    "/icons/kubernetes/default.svg"
  );
}

function getResourceStatus(resource: AnyKubernetesResource) {
  // Extract status based on resource type
  if (resource.kind === "Deployment") {
    const deployment = resource as any;
    const readyReplicas = deployment.status?.readyReplicas || 0;
    const replicas = deployment.spec?.replicas || 0;
    return readyReplicas === replicas && replicas > 0 ? "Running" : "Preparing";
  }

  if (resource.kind === "Cluster") {
    const cluster = resource as any;
    return cluster.status?.phase || "Unknown";
  }

  if (resource.kind === "ObjectStorageBucket") {
    const bucket = resource as any;
    return bucket.status?.phase || "Active";
  }

  return "Active";
}

function getResourceDetails(resource: AnyKubernetesResource) {
  const details: Record<string, string> = {};

  if (resource.kind === "Deployment") {
    const deployment = resource as any;
    details.Replicas = `${deployment.status?.readyReplicas || 0}/${
      deployment.spec?.replicas || 0
    }`;
    details.Image =
      deployment.spec?.template?.spec?.containers?.[0]?.image || "N/A";
    details.Namespace = resource.metadata?.namespace || "default";
  }

  if (resource.kind === "Cluster") {
    const cluster = resource as any;
    details.Type =
      cluster.metadata?.labels?.[CLUSTER_DEFINITION_LABEL_KEY] || "Unknown";
    details.Region = cluster.spec?.region || "N/A";
    details.Created =
      new Date(
        resource.metadata?.creationTimestamp || ""
      ).toLocaleDateString() || "N/A";
  }

  if (resource.kind === "ObjectStorageBucket") {
    const bucket = resource as any;
    details.Policy = bucket.spec?.policy || "private";
    details.Region = bucket.spec?.region || "N/A";
    details.Created =
      new Date(
        resource.metadata?.creationTimestamp || ""
      ).toLocaleDateString() || "N/A";
  }

  if (resource.kind === "Devbox") {
    const devbox = resource as any;
    details.Runtime = devbox.spec?.runtime?.name || "N/A";
    details.CPU = `${devbox.spec?.resource?.cpu || "N/A"}`;
    details.Memory = `${devbox.spec?.resource?.memory || "N/A"}`;
  }

  return details;
}

function getResourceId(
  resource: AnyKubernetesResource & { resourceType: string }
) {
  const name = resource.metadata?.name || "unknown";
  const kind = resource.kind || "unknown";
  /*
   * Prefer the Kubernetes UID when available because it is guaranteed
   * to be unique and stable.  When it is not present (e.g. for mock
   * resources coming from inventories), fall back to a deterministic
   * id based on kind + name so that the key remains **stable across
   * renders**.  Avoid using Math.random() because that generates a new
   * value on every render and causes React to think the element was
   * unmounted, which made the card "disappear" after dragging.
   */
  const uid = resource.metadata?.uid;
  return uid ? `${kind}-${name}-${uid}` : `${kind}-${name}`;
}

function ResourceCard({
  resource,
  isDragOverlay = false,
  isDragging = false,
  isExpanded = false,
  onToggleExpand,
}: {
  resource: AnyKubernetesResource & { resourceType: string };
  isDragOverlay?: boolean;
  isDragging?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const name = resource.metadata?.name || "Unknown";
  const kind = resource.kind || "Unknown";
  const resourceConfig = getResourceConfigFromKind(kind);
  const icon = getResourceIcon(resource);
  const status = getResourceStatus(resource);
  const details = getResourceDetails(resource);
  const id = getResourceId(resource);

  if (isDragOverlay) {
    return (
      <div className="space-y-0 pointer-events-none">
        <div className="border rounded-lg py-1.5 px-3 bg-background shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-0.5 rounded">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            {/* Icon */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
              {icon && (
                <Image src={icon} alt={`${kind} Icon`} width={20} height={20} />
              )}
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {name}
              </h3>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {kind}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Non-overlay sortable card

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data: {
        resourceTarget: convertToResourceTarget(resource, resourceConfig),
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const cardContent = (
    <div className="space-y-0" ref={setNodeRef} style={style} {...attributes}>
      <div
        className={`border rounded-lg py-1.5 px-3 transition-colors ${
          isDragging ? "opacity-50 bg-muted" : "bg-background hover:bg-muted/50"
        } ${isExpanded ? "rounded-b-none" : ""}`}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle - only this part is draggable */}
          <div
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded drag-handle"
            data-drag-handle="true"
            {...listeners}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>

          {/* Icon */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            {icon ? (
              <Image
                src={icon}
                alt={`${kind} Icon`}
                width={20}
                height={20}
                className="rounded-lg"
                onError={(e) => {
                  // Fallback to text if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <span className="text-foreground text-xs font-medium hidden">
              {kind.charAt(0)}
            </span>
          </motion.div>

          {/* Content - clickable area */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={onToggleExpand}
          >
            <h3 className="font-semibold text-foreground text-sm truncate">
              {name}
            </h3>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {kind}
            </Badge>
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 text-gray-700 flex-shrink-0"
              style={{ backgroundColor: "#D4DADB" }}
            >
              {status}
            </motion.span>
          </div>

          {/* Expand/Collapse Arrow */}
          {!isDragOverlay && onToggleExpand && (
            <motion.div
              animate={{ rotate: isExpanded ? -90 : 0 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer p-1 hover:bg-muted rounded"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Panel (no animation) */}
      {isExpanded && (
        <div className="border border-t-0 rounded-b-lg bg-muted/30 px-3 py-2 space-y-1 overflow-hidden">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="mb-1.5"
    >
      {cardContent}
    </motion.div>
  );
}

export function ResourceCards({ resources }: ResourceCardsProps) {
  const [orderedResources, setOrderedResources] = useState(resources);
  const [activeResource, setActiveResource] = useState<
    (AnyKubernetesResource & { resourceType: string }) | null
  >(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Update ordered resources when props change
  useEffect(() => {
    setOrderedResources(resources);
  }, [resources]);

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No resources found matching your criteria
      </div>
    );
  }

  const sortableIds = orderedResources.map(getResourceId);

  // --- Drag Handlers -----------------------------------------------------
  function handleDragStart(event: any) {
    const { active } = event;
    const resource = orderedResources.find(
      (r) => getResourceId(r) === active.id
    );
    setActiveResource(resource || null);
    setDraggedId(active.id);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    // Always reset drag state first
    setActiveResource(null);
    setDraggedId(null);

    // Only handle sortable operations within this list
    if (!over) return;

    // Check if this is a sortable operation (both active and over are in our list)
    const isActiveInList = orderedResources.some(
      (r) => getResourceId(r) === active.id
    );
    const isOverInList = orderedResources.some(
      (r) => getResourceId(r) === over.id
    );

    // Only proceed with reordering if both items are in our list
    if (isActiveInList && isOverInList && active.id !== over.id) {
      const oldIndex = orderedResources.findIndex(
        (r) => getResourceId(r) === active.id
      );
      const newIndex = orderedResources.findIndex(
        (r) => getResourceId(r) === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        setOrderedResources(arrayMove(orderedResources, oldIndex, newIndex));
      }
    }
  }

  // ----------------------------------------------------------------------
  // Register drag monitor to track drag state for visual feedback
  // ----------------------------------------------------------------------
  useDndMonitor({
    onDragStart: (event) => {
      // Only track drag start if it's one of our resources
      const resource = orderedResources.find(
        (r) => getResourceId(r) === event.active.id
      );
      if (resource) {
        setActiveResource(resource);
        setDraggedId(String(event.active.id));
      }
    },
    onDragEnd: (event) => {
      // Reset drag state and handle sortable operations
      handleDragEnd(event);
    },
  });

  function toggleExpand(resourceId: string) {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SortableContext
        items={sortableIds}
        strategy={verticalListSortingStrategy}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {orderedResources.map((resource, index) => {
            const resourceId = getResourceId(resource);
            return (
              <motion.div
                key={resourceId}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.1 + 0.3,
                  mass: 0.8,
                }}
              >
                <ResourceCard
                  resource={resource}
                  isDragging={draggedId === resourceId}
                  isExpanded={expandedIds.has(resourceId)}
                  onToggleExpand={() => toggleExpand(resourceId)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </SortableContext>
      <DragOverlay>
        {activeResource ? (
          <ResourceCard resource={activeResource} isDragOverlay />
        ) : null}
      </DragOverlay>
    </div>
  );
}
