
export const COST_CENTER_ENDPOINTS = {
  ACCOUNT_BALANCE: "/api/account/getAmount",
  PLAN_TRANSACTION: "/api/plan/transaction",
} as const;

export const COST_CENTER_DEFAULTS = {
  REGION_DOMAIN: "usw.sealos.io",
  REFRESH_INTERVAL: 30000, 
  STALE_TIME: 10000, 
} as const;

export const COST_CENTER_ERRORS = {
  MISSING_AUTHORIZATION: "Authorization token is required",
  MISSING_CONTEXT: "Missing required context: workspace, regionDomain, or internalToken",
  API_ERROR: "API request failed",
  INVALID_RESPONSE: "Invalid response from server",
} as const;

export const COST_CENTER_STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
