export const CLUSTER_CONSTANT_TYPE_VERSION = {
	postgresql: [
		"postgresql-16.4.0",
		"postgresql-14.8.0",
		"postgresql-14.7.2",
		"postgresql-12.15.0",
		"postgresql-12.14.1",
		"postgresql-12.14.0",
	],
	mongodb: [
		"mongodb-8.0.4",
		"mongodb-6.0",
		"mongodb-5.0",
		"mongodb-4.4",
		"mongodb-4.2",
	],
	"apecloud-mysql": ["ac-mysql-8.0.30-1", "ac-mysql-8.0.30"],
	redis: ["redis-7.2.7", "redis-7.0.6"],
	kafka: ["kafka-3.3.2"],
	weaviate: ["weaviate-1.18.0"],
	pulsar: ["pulsar-3.0.2", "pulsar-2.11.2"],
	clickhouse: ["clickhouse-24.8.3"],
	milvus: ["milvus-2.4.5"],
} as const;
