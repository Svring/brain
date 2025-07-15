import { z } from "zod";

// Define the Destination and Source schema
const EndpointSchema = z.object({
  identity: z.number(),
  labels: z.array(z.string()),
  pod: z.string(),
  port: z.number(),
});

// Define the Flow schema (used in flows.inbound.data and flows.outbound.data)
const FlowSchema = z.object({
  destination: EndpointSchema,
  direction: z.enum(["EGRESS", "INGRESS"]),
  node_name: z.string(),
  protocol: z.enum(["TCP"]),
  source: EndpointSchema,
  time: z.string().datetime(),
  verdict: z.enum(["FORWARDED"]),
});

// Define the Flows schema
const FlowsSchema = z.object({
  inbound: z.object({
    count: z.number(),
    data: z.array(FlowSchema).nullable(),
  }),
  outbound: z.object({
    count: z.number(),
    data: z.array(FlowSchema).nullable(),
  }),
});

// Define the Query schema
const QuerySchema = z.object({
  label: z.string(),
  limit: z.number(),
  minutes_ago: z.number(),
  pod: z.string(),
  since: z.string().datetime(),
});

// Define the Stats schema
const StatsSchema = z.object({
  inbound: z.object({
    total: z.number(),
    protocols: z.record(z.string(), z.number()),
    verdicts: z.record(z.string(), z.number()),
    ports: z.record(z.string(), z.number()),
    endpoints: z.record(z.string(), z.number()),
    bytes_count: z.number(),
  }),
  outbound: z.object({
    total: z.number(),
    protocols: z.record(z.string(), z.number()),
    verdicts: z.record(z.string(), z.number()),
    ports: z.record(z.string(), z.number()),
    endpoints: z.record(z.string(), z.number()),
    bytes_count: z.number(),
  }),
});

// Define the main schema
const NetworkFlowSchema = z.object({
  flows: FlowsSchema,
  query: QuerySchema,
  stats: StatsSchema,
  status: z.enum(["success"]),
  timestamp: z.string().datetime(),
  total_flows: z.number(),
});

// Export the schema
export { NetworkFlowSchema };
