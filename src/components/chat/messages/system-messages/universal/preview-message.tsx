import React, { useState } from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCopy } from "@/hooks/use-copy";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { useResourceObjects } from "@/hooks/sealos/resource/use-resource-objects";
import {
  Copy,
  Check,
  CircleCheckBig,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useInterval } from "@reactuses/core";
import { HoverPeek } from "@/components/ui/link-preview";

interface PreviewMessageProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
}

export const PreviewMessage: React.FC<PreviewMessageProps> = ({ target }) => {
  // Get all nodes from flowgraph state
  const { nodes } = useFlowgraphState();

  // Extract targets from network type nodes
  const networkTargets = nodes
    .filter((node) => node.type === "network" && node.data?.target)
    .map((node) => node.data.target);

  // Use resource objects hook with network targets
  const resourceObjects = useResourceObjects(networkTargets as any);

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

  const { copyToClipboard, isCopied } = useCopy();
  const [urlStatuses, setUrlStatuses] = useState<
    Record<string, { isSuccess: boolean }>
  >({});

  const checkUrlStatus = async (url: string) => {
    try {
      const response = await fetch(
        `/api/check-url?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      setUrlStatuses((prev) => ({
        ...prev,
        [url]: {
          isSuccess: data.ok,
        },
      }));
    } catch (error) {
      console.log(`URL check failed for ${url}, will retry...`, error);
      setUrlStatuses((prev) => ({
        ...prev,
        [url]: {
          isSuccess: false,
        },
      }));
    }
  };

  // Check all URL statuses every 3 seconds
  useInterval(
    () => {
      websiteUrls.forEach((url) => {
        checkUrlStatus(url);
      });
    },
    3000,
    { immediate: true }
  );

  const handleCopyUrl = (url: string) => {
    copyToClipboard(url, `preview-url-${url}`);
  };

  const handleUrlClick = (url: string) => {
    window.open(url, "_blank");
  };

  // If no addresses available
  if (websiteUrls.length === 0) {
    return (
      <div className="w-full border rounded-lg p-4">
        <span className="text-muted-foreground">
          No public domain available
        </span>
      </div>
    );
  }

  // Calculate loading status
  const totalUrls = websiteUrls.length;
  const loadedUrls = Object.values(urlStatuses).filter(
    (status) => status.isSuccess
  ).length;
  const allLoaded = totalUrls > 0 && loadedUrls === totalUrls;
  const someLoaded = loadedUrls > 0;

  return (
    <div className="w-full border rounded-lg p-2">
      {/* Status hint */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">
          {allLoaded
            ? "All previews ready"
            : someLoaded
            ? `Previews are loading, please wait (${loadedUrls}/${totalUrls})`
            : "Previews are loading, please wait"}
        </p>
      </div>

      <div className="">
        {websiteUrls.map((url, index) => {
          const status = urlStatuses[url] || {
            isSuccess: false,
          };

          return (
            <div key={url} className="flex items-center gap-3 py-2">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {status.isSuccess ? (
                  <CircleCheckBig className="h-4 w-4 text-theme-green" />
                ) : (
                  <Spinner
                    variant="ring"
                    size={16}
                    className="text-theme-yellow"
                  />
                )}
              </div>

              {/* URL with HoverPeek */}
              <div className="flex-1 min-w-0">
                <HoverPeek
                  url={url}
                  peekWidth={300}
                  peekHeight={200}
                  enableLensEffect={true}
                  enableMouseFollow={true}
                >
                  <button
                    onClick={() => handleUrlClick(url)}
                    className="text-left w-full"
                  >
                    <span className="font-mono text-sm text-foreground hover:text-blue-600 hover:underline transition-colors break-all">
                      {url}
                    </span>
                  </button>
                </HoverPeek>
              </div>

              {/* Copy Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleCopyUrl(url)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
                >
                  {isCopied(`preview-url-${url}`) ? (
                    <Check className="h-4 w-4 text-theme-green" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviewMessage;
