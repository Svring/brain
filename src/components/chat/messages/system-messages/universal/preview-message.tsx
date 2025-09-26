import React, { useState } from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useCopy } from "@/hooks/use-copy";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { useResourceObjects } from "@/hooks/sealos/resource/use-resource-objects";
import {
  Copy,
  Check,
  CircleCheckBig,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useInterval } from "@reactuses/core";

interface PreviewMessageProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
}

export const PreviewMessage: React.FC<PreviewMessageProps> = ({ target }) => {
  // Get all nodes from flowgraph state
  const { nodes } = useFlowgraphState();

  // Log all nodes
  // console.log("All nodes in preview:", nodes);

  // Extract targets from network type nodes
  const networkTargets = nodes
    .filter((node) => node.type === "network" && node.data?.target)
    .map((node) => node.data.target);

  // Use resource objects hook with network targets
  const resourceObjects = useResourceObjects(networkTargets as any);

  // Log the resource objects result
  // console.log("Network targets:", networkTargets);
  // console.log("Resource objects result:", resourceObjects.data);

  // Extract public domains from ports of resource objects
  const websiteUrls = React.useMemo(() => {
    if (!resourceObjects.data || !Array.isArray(resourceObjects.data)) {
      return [];
    }

    const publicDomains: string[] = [];

    resourceObjects.data.forEach((resource: any) => {
      if (resource?.ports && Array.isArray(resource.ports)) {
        resource.ports.forEach((port: any) => {
          if (port?.publicAddress) {
            publicDomains.push(port.publicAddress);
          }
        });
      }
    });

    return publicDomains;
  }, [resourceObjects.data]);

  // Log extracted public domains
  // console.log("Extracted public domains:", websiteUrls);

  const { copyToClipboard, isCopied } = useCopy();
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const websiteUrl = websiteUrls[currentIndex];

  const handleCopyUrl = () => {
    copyToClipboard(websiteUrl, "preview-url");
  };

  const handleIframeLoad = () => {
    setIsSuccess(true);
  };

  const handleIframeError = () => {
    setIsSuccess(false);
  };

  const handleIframeClick = () => {
    window.open(websiteUrl, "_blank");
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : websiteUrls.length - 1));
    setIsSuccess(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < websiteUrls.length - 1 ? prev + 1 : 0));
    setIsSuccess(false);
  };

  const checkUrlStatus = async () => {
    try {
      const response = await fetch(
        `/api/check-url?url=${encodeURIComponent(websiteUrl)}`
      );
      const data = await response.json();

      // console.log("URL check response:", data);

      if (data.ok) {
        setIsSuccess(true);
      } else {
        console.log(
          `URL returned status ${data.status}: ${data.statusText || data.error}`
        );
        setIsSuccess(false);
      }
    } catch (error) {
      console.log("URL check failed, will retry...", error);
      setIsSuccess(false);
    }
  };

  // Check URL status every 2 seconds
  useInterval(
    () => {
      checkUrlStatus();
    },
    3000,
    { immediate: true }
  );

  // If no addresses available
  if (websiteUrls.length === 0) {
    return (
      <div className="w-full border rounded-lg p-1">
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            No public domain available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg p-1 bg-background-secondary">
      <div className="flex items-center justify-between gap-2 pb-1">
        {websiteUrls.length > 1 && (
          <Button
            onClick={handlePrevious}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className="flex items-center gap-1">
            {isSuccess ? (
              <CircleCheckBig className="h-4 w-4 text-theme-green" />
            ) : (
              <Spinner variant="ring" size={16} className="text-theme-yellow" />
            )}
          </div>

          <span
            className={`cursor-pointer hover:underline transition-all font-mono text-sm ${
              isSuccess ? "text-foreground" : "text-muted-foreground"
            }`}
            onClick={handleCopyUrl}
          >
            {websiteUrl}
          </span>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isCopied("preview-url") ? (
              <>
                <Check className="h-4 w-4 text-theme-green" />
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {websiteUrls.length > 1 && (
          <Button
            onClick={handleNext}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        className="relative w-full cursor-pointer hover:opacity-90 transition-opacity"
        style={{ aspectRatio: "16/9" }}
        onClick={handleIframeClick}
      >
        {isSuccess ? (
          <iframe
            src={websiteUrl}
            className="w-full h-full rounded-lg pointer-events-none"
            title="Resource Preview"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : (
          <div className="w-full h-full rounded-lg bg-muted/20 flex items-center justify-center">
            <TextShimmer as="div" className="" duration={1.5} spread={1.5}>
              Initiating
            </TextShimmer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewMessage;
