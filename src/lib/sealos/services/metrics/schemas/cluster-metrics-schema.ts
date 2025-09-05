import { z } from "zod";
import { getCurrentUnixTime, getMonitorTimespan } from "@/lib/date/date-utils";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";

// Database types enum
export const DatabaseTypeSchema = z.enum([
  "mysql",
  "postgresql",
  "mongodb",
  "redis",
  "kafka",
  "minio",
]);

// MySQL query types
export const MySQLQueryTypeSchema = z.enum([
  "cpu",
  "memory",
  "disk",
  "disk_capacity",
  "disk_used",
  "uptime",
  "connections",
  "commands",
  "innodb",
  "slow_queries",
  "aborted_connections",
  "table_locks",
]);

// PostgreSQL query types
export const PostgreSQLQueryTypeSchema = z.enum([
  "cpu",
  "memory",
  "disk",
  "disk_capacity",
  "disk_used",
  "uptime",
  "connections",
  "commands",
  "db_size",
  "active_connections",
  "rollbacks",
  "commits",
  "tx_duration",
  "block_read_time",
  "block_write_time",
]);

// MongoDB query types
export const MongoDBQueryTypeSchema = z.enum([
  "cpu",
  "memory",
  "disk",
  "disk_capacity",
  "disk_used",
  "uptime",
  "connections",
  "commands",
  "db_size",
  "document_ops",
  "pg_faults",
]);

// Redis query types
export const RedisQueryTypeSchema = z.enum([
  "cpu",
  "memory",
  "disk",
  "disk_capacity",
  "disk_used",
  "uptime",
  "connections",
  "commands",
  "db_items",
  "hits_ratio",
  "commands_duration",
  "blocked_connections",
  "key_evictions",
]);

// Kafka query types
export const KafkaQueryTypeSchema = z.enum([
  "cpu",
  "memory",
  "disk",
  "disk_capacity",
  "disk_used",
]);

// MinIO query types
export const MinIOQueryTypeSchema = z.enum([
  "minio_bucket_usage_object_total",
  "minio_bucket_usage_total_bytes",
  "minio_bucket_traffic_received_bytes",
  "minio_bucket_traffic_sent_bytes",
]);

// Cluster metrics query request schema
export const GetClusterMetricsRequestSchema = z
  .object({
    namespace: z.string().min(1, "Namespace is required"),
    query: z.string().optional(), // Custom query expression
    type: z
      .enum(Object.keys(CLUSTER_CONSTANT_TYPE_VERSION) as [string, ...string[]])
      .optional(), // Predefined query type
    app: z.string().min(1, "App name is required"),
    // For instant queries
    time: z.string().optional(),
    // For range queries
    start: z.string().optional(),
    end: z.string().optional(),
    step: z.string().optional(),
  })
  .transform((data) => {
    // Auto-set start, end, and step only if time is not provided (range query)
    if (!data.time && (!data.start || !data.end || !data.step)) {
      const currentTime = getCurrentUnixTime();
      const timespan = getMonitorTimespan(currentTime); // 1 hour earlier

      return {
        ...data,
        start: data.start || timespan.start.toString(),
        end: data.end || timespan.end.toString(),
        step: data.step || "120s", // 120 seconds
      };
    }

    return data;
  })
  .refine(
    (data) => {
      // Must have either custom query or predefined type
      if (!data.query && !data.type) {
        return false;
      }

      // For time-based queries, either provide time OR start/end/step
      const hasInstantQuery = data.time;
      const hasRangeQuery = data.start && data.end && data.step;

      if (hasInstantQuery && hasRangeQuery) {
        return false; // Cannot have both
      }

      if (!hasInstantQuery && !hasRangeQuery) {
        return false; // Must have one or the other
      }

      return true;
    },
    {
      message:
        "Must provide either 'query' or 'type', and either 'time' for instant query or 'start/end/step' for range query",
      path: ["query"],
    }
  )
  .refine(
    (data) => {
      // If cluster type is specified, validate that query type is valid for that cluster
      if (data.type && data.query) {
        const clusterType = data.type;
        const queryType = data.query;

        // Get the valid query types for the specified cluster type
        let validQueryTypes: string[] = [];

        switch (clusterType) {
          case "apecloud-mysql":
            validQueryTypes = MySQLQueryTypeSchema.options;
            break;
          case "postgresql":
            validQueryTypes = PostgreSQLQueryTypeSchema.options;
            break;
          case "mongodb":
            validQueryTypes = MongoDBQueryTypeSchema.options;
            break;
          case "redis":
            validQueryTypes = RedisQueryTypeSchema.options;
            break;
          case "kafka":
            validQueryTypes = KafkaQueryTypeSchema.options;
            break;
          case "weaviate":
          case "milvus":
          case "pulsar":
            // These don't have specific query type schemas, so any query is valid
            return true;
          default:
            return false; // Invalid cluster type
        }

        // Check if the query type is valid for the cluster type
        return validQueryTypes.includes(queryType);
      }

      return true; // No validation needed if no cluster type or no query
    },
    {
      message: "Query type is not valid for the specified cluster type",
      path: ["query"],
    }
  );

// Cluster metrics query response schema (same as LaunchPad)
export const GetClusterMetricsResponseSchema = z.object({
  status: z.string(),
  isPartial: z.boolean().optional(), // Made optional since API doesn't always return it
  data: z.object({
    resultType: z.string(),
    result: z.array(
      z.object({
        metric: z.record(z.string(), z.string()),
        value: z.tuple([z.number(), z.string()]).nullable().optional(), // Allow null for matrix results
        values: z.array(z.tuple([z.number(), z.string()])).optional(), // For range queries
      })
    ),
  }),
  stats: z
    .object({
      execTime: z.number(),
    })
    .optional(), // Made optional since API doesn't always return it
});

// Type exports
export type DatabaseType = z.infer<typeof DatabaseTypeSchema>;
export type MySQLQueryType = z.infer<typeof MySQLQueryTypeSchema>;
export type PostgreSQLQueryType = z.infer<typeof PostgreSQLQueryTypeSchema>;
export type MongoDBQueryType = z.infer<typeof MongoDBQueryTypeSchema>;
export type RedisQueryType = z.infer<typeof RedisQueryTypeSchema>;
export type KafkaQueryType = z.infer<typeof KafkaQueryTypeSchema>;
export type MinIOQueryType = z.infer<typeof MinIOQueryTypeSchema>;
export type GetClusterMetricsRequest = z.infer<
  typeof GetClusterMetricsRequestSchema
>;
export type GetClusterMetricsResponse = z.infer<
  typeof GetClusterMetricsResponseSchema
>;
