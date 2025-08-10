"use client";

/**
 * Transforms URL format from subdomain.sealos.run to sealossubdomain.site
 * Example: bja.sealos.run -> sealosbja.site
 * Unlike convertToDbconnUrl, this function preserves the protocol and doesn't add 'dbconn.' prefix
 */
export function transformRegionUrl(url: string): string {
  // If URL ends with 'io', return as is
  if (url.endsWith(".io")) {
    return url;
  }

  // Extract protocol if present
  const protocolMatch = url.match(/^(https?:\/\/)/);
  const protocol = protocolMatch ? protocolMatch[1] : "";
  const urlWithoutProtocol = url.replace(/^https?:\/\//, "");

  // Split by dots
  const parts = urlWithoutProtocol.split(".");

  // Check if it matches the expected pattern (subdomain.sealos.run)
  if (parts.length === 3 && parts[1] === "sealos" && parts[2] === "run") {
    const subdomain = parts[0];
    return `${protocol}sealos${subdomain}.site`;
  }

  // Return original if pattern doesn't match
  return url;
}