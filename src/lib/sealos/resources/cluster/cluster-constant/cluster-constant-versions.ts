export const CLUSTER_TYPE_VERSION_MAP = {
  postgresql: [
    { id: "postgresql-14.8.0", label: "postgresql-14.8.0" },
    { id: "postgresql-14.7.2", label: "postgresql-14.7.2" },
    { id: "postgresql-12.15.0", label: "postgresql-12.15.0" },
    { id: "postgresql-12.14.1", label: "postgresql-12.14.1" },
    { id: "postgresql-12.14.0", label: "postgresql-12.14.0" },
  ],
  mongodb: [
    { id: "mongodb-6.0", label: "mongodb-6.0" },
    { id: "mongodb-5.0.14", label: "mongodb-5.0.14" },
    { id: "mongodb-5.0", label: "mongodb-5.0" },
    { id: "mongodb-4.4", label: "mongodb-4.4" },
    { id: "mongodb-4.2", label: "mongodb-4.2" },
    { id: "mongodb-4.0", label: "mongodb-4.0" },
  ],
  "apecloud-mysql": [
    { id: "ac-mysql-8.0.31", label: "ac-mysql-8.0.31" },
    { id: "ac-mysql-8.0.30", label: "ac-mysql-8.0.30" },
  ],
  redis: [{ id: "redis-7.0.6", label: "redis-7.0.6" }],
  kafka: [{ id: "kafka-3.3.2", label: "kafka-3.3.2" }],
  weaviate: [{ id: "weaviate-1.18.0", label: "weaviate-1.18.0" }],
  milvus: [
    { id: "milvus-2.4.5", label: "milvus-2.4.5" },
    { id: "milvus-2.3.3", label: "milvus-2.3.3" },
    { id: "milvus-2.3.2", label: "milvus-2.3.2" },
    { id: "milvus-2.2.4", label: "milvus-2.2.4" },
  ],
  pulsar: [{ id: "pulsar-2.11.2", label: "pulsar-2.11.2" }],
} as const;