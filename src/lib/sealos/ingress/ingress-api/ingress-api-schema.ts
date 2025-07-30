export interface ProtocolCheckResult {
  protocol: string;
  url: string;
  available: boolean;
  error?: string;
  responseTime?: number;
}