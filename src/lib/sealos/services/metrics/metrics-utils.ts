import type {
  GetLaunchPadMetricsRequest,
  GetLaunchPadMetricsResponse,
} from "./schemas/metrics-query-schema";
import type {
  GetClusterMetricsRequest,
  GetClusterMetricsResponse,
  DatabaseType,
  MySQLQueryType,
  PostgreSQLQueryType,
  MongoDBQueryType,
  RedisQueryType,
  KafkaQueryType,
  MinIOQueryType,
} from "./schemas/cluster-metrics-schema";
import type { MetricsApiContext } from "./schemas/metrics-api-context-schema";
import { LAUNCHPAD_METRICS_TEST_URL } from "./metrics-constant/metrics-constant-url";

// ============================================================================
// METRICS UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a range query request for LaunchPad metrics
 */
export const createLaunchPadRangeQuery = (
  namespace: string,
  type: GetLaunchPadMetricsRequest["type"],
  launchPadName: string,
  start: string,
  end: string,
  step: string
): GetLaunchPadMetricsRequest => ({
  namespace,
  type,
  launchPadName,
  start,
  end,
  step,
});

/**
 * Create an instant query request for metrics
 */
export const createInstantQuery = (
  namespace: string,
  type: GetLaunchPadMetricsRequest["type"],
  launchPadName: string,
  time: string
): GetLaunchPadMetricsRequest => ({
  namespace,
  type,
  launchPadName,
  time,
});

/**
 * Check if the response is a range query result
 */
export const isRangeQueryResult = (
  response: GetLaunchPadMetricsResponse
): boolean => {
  return response.data.resultType === "matrix";
};

/**
 * Check if the response is an instant query result
 */
export const isInstantQueryResult = (
  response: GetLaunchPadMetricsResponse
): boolean => {
  return response.data.resultType === "vector";
};

/**
 * Extract CPU usage value from metrics response
 */
export const extractCpuUsage = (
  response: GetLaunchPadMetricsResponse
): number | null => {
  if (!response.data.result || response.data.result.length === 0) {
    return null;
  }

  const result = response.data.result[0];

  if (isInstantQueryResult(response) && result.value) {
    return parseFloat(result.value[1]);
  }

  if (
    isRangeQueryResult(response) &&
    result.values &&
    result.values.length > 0
  ) {
    // Return the latest value for range queries
    return parseFloat(result.values[result.values.length - 1][1]);
  }

  return null;
};

/**
 * Extract memory usage value from metrics response
 */
export const extractMemoryUsage = (
  response: GetLaunchPadMetricsResponse
): number | null => {
  if (!response.data.result || response.data.result.length === 0) {
    return null;
  }

  const result = response.data.result[0];

  if (isInstantQueryResult(response) && result.value) {
    return parseFloat(result.value[1]);
  }

  if (
    isRangeQueryResult(response) &&
    result.values &&
    result.values.length > 0
  ) {
    // Return the latest value for range queries
    return parseFloat(result.values[result.values.length - 1][1]);
  }

  return null;
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

/**
 * Validate metrics query parameters
 */
export const validateLaunchPadMetricsQuery = (
  request: GetLaunchPadMetricsRequest
): string[] => {
  const errors: string[] = [];

  if (!request.namespace) {
    errors.push("Namespace is required");
  }

  if (!request.launchPadName) {
    errors.push("LaunchPad name is required");
  }

  if (!request.type) {
    errors.push("Type is required");
  }

  const hasRangeParams = request.start && request.end && request.step;
  const hasInstantParam = request.time;

  if (!hasRangeParams && !hasInstantParam) {
    errors.push(
      "Must provide either (start, end, step) for range query or (time) for instant query"
    );
  }

  if (hasRangeParams && hasInstantParam) {
    errors.push(
      "Cannot provide both range query parameters and instant query parameter"
    );
  }

  return errors;
};

// ============================================================================
// CLUSTER METRICS UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a cluster metrics request with predefined type
 */
export const createClusterMetricsQuery = (
  namespace: string,
  app: string,
  type: string,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest => ({
  namespace,
  app,
  type,
  ...(time && { time }),
  ...(start && { start }),
  ...(end && { end }),
  ...(step && { step }),
});

/**
 * Create a cluster metrics request with custom query
 */
export const createClusterCustomQuery = (
  namespace: string,
  app: string,
  query: string,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest => ({
  namespace,
  app,
  query,
  ...(time && { time }),
  ...(start && { start }),
  ...(end && { end }),
  ...(step && { step }),
});

/**
 * Create MySQL metrics query
 */
export const createMySQLMetricsQuery = (
  namespace: string,
  app: string,
  type: MySQLQueryType,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest =>
  createClusterMetricsQuery(namespace, app, type, time, start, end, step);

/**
 * Create PostgreSQL metrics query
 */
export const createPostgreSQLMetricsQuery = (
  namespace: string,
  app: string,
  type: PostgreSQLQueryType,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest =>
  createClusterMetricsQuery(namespace, app, type, time, start, end, step);

/**
 * Create MongoDB metrics query
 */
export const createMongoDBMetricsQuery = (
  namespace: string,
  app: string,
  type: MongoDBQueryType,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest =>
  createClusterMetricsQuery(namespace, app, type, time, start, end, step);

/**
 * Create Redis metrics query
 */
export const createRedisMetricsQuery = (
  namespace: string,
  app: string,
  type: RedisQueryType,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest =>
  createClusterMetricsQuery(namespace, app, type, time, start, end, step);

/**
 * Create Kafka metrics query
 */
export const createKafkaMetricsQuery = (
  namespace: string,
  app: string,
  type: KafkaQueryType,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest =>
  createClusterMetricsQuery(namespace, app, type, time, start, end, step);

/**
 * Create MinIO metrics query
 */
export const createMinIOMetricsQuery = (
  namespace: string,
  app: string,
  type: MinIOQueryType,
  time?: string,
  start?: string,
  end?: string,
  step?: string
): GetClusterMetricsRequest =>
  createClusterMetricsQuery(namespace, app, type, time, start, end, step);

/**
 * Extract metrics value from cluster metrics response
 */
export const extractClusterMetricsValue = (
  response: GetClusterMetricsResponse
): number | null => {
  if (!response.data.result || response.data.result.length === 0) {
    return null;
  }

  const result = response.data.result[0];

  if (response.data.resultType === "vector" && result.value) {
    return parseFloat(result.value[1]);
  }

  if (
    response.data.resultType === "matrix" &&
    result.values &&
    result.values.length > 0
  ) {
    // Return the latest value for range queries
    return parseFloat(result.values[result.values.length - 1][1]);
  }

  return null;
};

/**
 * Get all metrics values from cluster metrics response (for range queries)
 */
export const extractClusterMetricsTimeSeries = (
  response: GetClusterMetricsResponse
): Array<{ timestamp: number; value: number }> => {
  if (!response.data.result || response.data.result.length === 0) {
    return [];
  }

  const result = response.data.result[0];

  if (response.data.resultType === "matrix" && result.values) {
    return result.values.map(([timestamp, value]) => ({
      timestamp,
      value: parseFloat(value),
    }));
  }

  if (response.data.resultType === "vector" && result.value) {
    return [
      {
        timestamp: result.value[0],
        value: parseFloat(result.value[1]),
      },
    ];
  }

  return [];
};

/**
 * Validate cluster metrics query parameters
 */
export const validateClusterMetricsQuery = (
  request: GetClusterMetricsRequest
): string[] => {
  const errors: string[] = [];

  if (!request.namespace) {
    errors.push("Namespace is required");
  }

  if (!request.app) {
    errors.push("App name is required");
  }

  if (!request.query && !request.type) {
    errors.push("Either 'query' or 'type' is required");
  }

  const hasRangeParams = request.start && request.end && request.step;
  const hasInstantParam = request.time;

  if (!hasRangeParams && !hasInstantParam) {
    errors.push(
      "Must provide either (start, end, step) for range query or (time) for instant query"
    );
  }

  if (hasRangeParams && hasInstantParam) {
    errors.push(
      "Cannot provide both range query parameters and instant query parameter"
    );
  }

  return errors;
};
