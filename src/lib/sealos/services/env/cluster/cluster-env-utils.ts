import type { Env } from "@/schemas/forms/universal/env-schema";

/**
 * Derives environment variables from cluster private connection
 * @param name - The cluster name used to generate environment variable names and secret references
 * @param type - The database type to determine the secret naming format
 * @returns An array of environment variables conforming to EnvSchema
 */
export const deriveClusterEnvVariable = (name: string, type: string): Env[] => {
	// Determine secret name based on database type
	// New format for MongoDB, Redis, and Kafka
	// Old format (-conn-credential) for other databases
	const secretName =
		type === "mongodb"
			? `${name}-mongodb-account-root`
			: type === "redis"
				? `${name}-redis-redis-account-default`
				: type === "kafka"
					? `${name}-broker-account-admin`
					: `${name}-conn-credential`; // fallback to old format

	const secretKeys = ["password", "username"];

	return secretKeys.map((key) => ({
		name: `${name.toUpperCase()}_${key.toUpperCase()}`,
		valueFrom: {
			secretKeyRef: {
				name: secretName,
				key: key,
			},
		},
	}));
};
