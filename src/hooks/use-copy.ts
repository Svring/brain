import { useState } from "react";
import { toast } from "sonner";

interface UseCopyOptions {
  timeout?: number;
}

export const useCopy = (options: UseCopyOptions = {}) => {
  const { timeout = 5000 } = options;
  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);

    // Show toast notification
    toast.success("Copied to clipboard");

    // Set the copy state to true (show check icon)
    setCopyStates((prev) => ({ ...prev, [key]: true }));

    // Reset back to copy icon after timeout
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [key]: false }));
    }, timeout);
  };

  const isCopied = (key: string) => copyStates[key] || false;

  return {
    copyToClipboard,
    isCopied,
    copyStates,
  };
};
