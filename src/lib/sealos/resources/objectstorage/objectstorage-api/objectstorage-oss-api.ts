import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Configuration
const client = new S3Client({
  region: "auto", // Use 'auto' for non-AWS S3-compatible OSS
  endpoint: "https://objectstorageapi.bja.sealos.run", // External endpoint
  credentials: {
    accessKeyId: "gapyo0ig",
    secretAccessKey: "wxbchz49k87httpm",
  },
  forcePathStyle: true, // Required for S3-compatible OSS like MinIO
});

// Function to list objects in a bucket folder
export async function listS3FolderObjects(
  bucket: string,
  prefix: string
): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix, // e.g., "folder/" to list files in a specific folder
    });
    const response = await client.send(command);
    const files = response.Contents?.map((item) => item.Key || "") || [];
    return files;
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    throw error;
  }
}
