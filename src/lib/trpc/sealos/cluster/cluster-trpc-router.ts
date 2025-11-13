import { initTRPC } from "@trpc/server";
import { runParallelAction } from "next-server-actions-parallel";
import { z } from "zod";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
	createClusterBackup,
	createClusterService,
	deleteClusterBackup,
	deleteClusterService,
	disableClusterPublicAccess,
	enableClusterPublicAccess,
	fetchClusterVersions,
	getCluster,
	getClusterBackupList,
	getClusterLogs,
	getClusterMonitorData,
	getCombinedMonitor,
	listClusters,
	pauseClusterService,
	restartClusterService,
	restoreClusterBackup,
	startClusterService,
	updateClusterService,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import {
	UpdateClusterRequestSchema,
	UpdateClusterResponseSchema,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api-schemas";
import {
	CreateBackupRequestSchema,
	CreateBackupResponseSchema,
	DeleteBackupRequestSchema,
	DeleteBackupResponseSchema,
	RestoreBackupRequestSchema,
	RestoreBackupResponseSchema,
} from "@/lib/sealos/resources/cluster/schemas/req-res-schemas/req-res-backup-schemas";
import {
	ClusterDeleteRequestSchema,
	ClusterDeleteResponseSchema,
} from "@/lib/sealos/resources/cluster/schemas/req-res-schemas/req-res-delete-schemas";
import {
	DisablePublicAccessRequestSchema,
	DisablePublicAccessResponseSchema,
	EnablePublicAccessRequestSchema,
	EnablePublicAccessResponseSchema,
} from "@/lib/sealos/resources/cluster/schemas/req-res-schemas/req-res-public-access-schemas";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { clusterUpdateFormSchema } from "@/schemas/forms/cluster/cluster-update-form-schema";
import type { ClusterContext } from "./cluster-trpc-context";

const t = initTRPC.context<ClusterContext>().create();

export const clusterRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Cluster Information
	get: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getCluster(ctx, input);
		}),

	list: t.procedure
		.input(z.string().optional().default("cluster"))
		.query(async ({ ctx, input }) => {
			return await listClusters(ctx);
		}),

	backups: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getClusterBackupList(ctx, input);
		}),

	logs: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getClusterLogs(ctx, ctx, input);
		}),

	versions: t.procedure.query(async ({ ctx }) => {
		return await fetchClusterVersions(ctx);
	}),

	// Monitoring
	monitor: t.procedure
		.input(
			z.object({
				dbName: z.string(),
				dbType: z.string(),
				queryKey: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { dbName, dbType, queryKey } = input;
			return await getClusterMonitorData(ctx, dbName, dbType, queryKey);
		}),

	combinedMonitor: t.procedure
		.input(
			z.object({
				dbName: z.string(),
				dbType: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { dbName, dbType } = input;
			return await getCombinedMonitor(ctx, dbName, dbType);
		}),

	// ===== MUTATION PROCEDURES =====

	// Cluster Lifecycle Management
	create: t.procedure
		.input(clusterCreateFormSchema)
		.mutation(async ({ input, ctx }) => {
			return await createClusterService(input, ctx);
		}),

	start: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await startClusterService(input, ctx);
		}),

	pause: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await pauseClusterService(input, ctx);
		}),

	restart: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await restartClusterService(input, ctx);
		}),

	update: t.procedure
		.input(clusterUpdateFormSchema)
		.output(UpdateClusterResponseSchema)
		.mutation(async ({ input, ctx }) => {
			return await updateClusterService(input, ctx);
		}),

	delete: t.procedure
		.input(ClusterDeleteRequestSchema)
		.output(ClusterDeleteResponseSchema)
		.mutation(async ({ input, ctx }) => {
			return await deleteClusterService(ctx, input);
		}),

	deleteBackup: t.procedure
		.input(
			z.object({
				clusterName: z.string(),
				backupName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { clusterName, backupName } = input;
			return await deleteClusterBackup(ctx, clusterName, backupName);
		}),

	// Backup Management
	createBackup: t.procedure
		.input(CreateBackupRequestSchema)
		// .output(CreateBackupResponseSchema)
		.mutation(async ({ input, ctx }) => {
			const { databaseName, remark } = input;
			return await createClusterBackup(ctx, databaseName, remark);
		}),

	restoreBackup: t.procedure
		.input(RestoreBackupRequestSchema)
		// .output(RestoreBackupResponseSchema)
		.mutation(async ({ input, ctx }) => {
			const { databaseName, backupName } = input;
			return await restoreClusterBackup(ctx, databaseName, backupName);
		}),

	// Public Access Management
	enablePublic: t.procedure
		.input(EnablePublicAccessRequestSchema)
		// .output(EnablePublicAccessResponseSchema)
		.mutation(async ({ input, ctx }) => {
			const { databaseName } = input;
			return await enableClusterPublicAccess(ctx, databaseName);
		}),

	disablePublic: t.procedure
		.input(DisablePublicAccessRequestSchema)
		// .output(DisablePublicAccessResponseSchema)
		.mutation(async ({ input, ctx }) => {
			const { databaseName } = input;
			return await disableClusterPublicAccess(ctx, databaseName);
		}),
});

export type ClusterRouter = typeof clusterRouter;
