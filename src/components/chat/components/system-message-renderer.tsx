"use client";

import { memo, useMemo } from "react";
import { get } from "lodash";
import { SystemMessageType } from "../messages/system-messages/systemp-message-types";

interface SystemMessageRendererProps {
  content: string;
}

export const SystemMessageRenderer = memo(function SystemMessageRenderer({
  content,
}: SystemMessageRendererProps) {
  const { type, target, payload } = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return {
        type: parsed.type,
        target: parsed.target,
        payload: parsed.payload,
      };
    } catch {
      return {};
    }
  }, [content]);

  const Component = type ? get(SystemMessageType, type) : null;
  return Component ? Component(target, payload) : null;
});
