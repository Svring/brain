import { z } from "zod";

// Create Backup Request Schema
export const CreateBackupRequestSchema = z.object({
  databaseName: z.string().min(1, "Database name is required"),
  remark: z.string().optional(),
});

// Create Backup Response Schema
export const CreateBackupResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    backupName: z.string(),
    databaseName: z.string(),
    dbType: z.string(),
    message: z.string(),
  }),
});

// Delete Backup Request Schema
export const DeleteBackupRequestSchema = z.object({
  databaseName: z.string().min(1, "Database name is required"),
  backupName: z.string().min(1, "Backup name is required"),
});

// Delete Backup Response Schema
export const DeleteBackupResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    databaseName: z.string(),
    backupName: z.string(),
    message: z.string(),
  }),
});

// Restore Backup Request Schema
export const RestoreBackupRequestSchema = z.object({
  databaseName: z.string().min(1, "Database name is required"),
  backupName: z.string().min(1, "Backup name is required"),
  //newDbName: z.string().min(1, "New database name is required"),
});

// Restore Backup Response Schema
export const RestoreBackupResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

// Type exports
export type CreateBackupRequest = z.infer<typeof CreateBackupRequestSchema>;
export type CreateBackupResponse = z.infer<typeof CreateBackupResponseSchema>;
export type DeleteBackupRequest = z.infer<typeof DeleteBackupRequestSchema>;
export type DeleteBackupResponse = z.infer<typeof DeleteBackupResponseSchema>;
export type RestoreBackupRequest = z.infer<typeof RestoreBackupRequestSchema>;
export type RestoreBackupResponse = z.infer<typeof RestoreBackupResponseSchema>;
