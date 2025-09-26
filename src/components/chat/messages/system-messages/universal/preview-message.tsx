import React, { useState, useEffect } from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Spinner } from "@/components/ui/spinner";
import { useCopy } from "@/hooks/use-copy";
import { Copy, Check, CircleCheckBig } from "lucide-react";

interface PreviewMessageProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
}

export const PreviewMessage: React.FC<PreviewMessageProps> = ({ target }) => {
  // Dummy website address for now
  const websiteUrl = "https://example.com";
  const { copyToClipboard, isCopied } = useCopy();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCopyUrl = () => {
    copyToClipboard(websiteUrl, "preview-url");
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIsSuccess(true);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIsSuccess(false);
  };

  const handleIframeClick = () => {
    window.open(websiteUrl, "_blank");
  };

  const checkUrlStatus = async () => {
    try {
      const response = await fetch(websiteUrl, {
        method: "HEAD",
        mode: "no-cors", // This allows checking without CORS issues
      });
      // Since we're using no-cors, we can't check the status code directly
      // But if the request doesn't throw an error, we consider it successful
      setIsLoading(false);
      setIsSuccess(true);
    } catch (error) {
      // If there's an error, we'll keep checking
      console.log("URL check failed, will retry...");
    }
  };

  // Check URL status every 2 seconds
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      checkUrlStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="w-full border rounded-lg p-1">
      <div
        className="relative w-full cursor-pointer hover:opacity-90 transition-opacity"
        style={{ aspectRatio: "16/9" }}
        onClick={handleIframeClick}
      >
        <iframe
          src={websiteUrl}
          className="w-full h-full border rounded-lg pointer-events-none"
          title="Resource Preview"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>

      <div className="flex items-center justify-center gap-2 py-1">
        <div className="flex items-center gap-1">
          {isLoading && <Spinner variant="ring" size={16} />}
          {!isLoading && isSuccess && (
            <CircleCheckBig className="h-4 w-4 text-theme-green" />
          )}
          {!isLoading && !isSuccess && (
            <div className="h-4 w-4 rounded-full bg-theme-yellow" />
          )}
        </div>

        <span
          className={`cursor-pointer hover:underline transition-all ${
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
    </div>
  );
};

export default PreviewMessage;
