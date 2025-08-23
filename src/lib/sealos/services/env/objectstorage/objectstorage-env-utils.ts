import type { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

/**
 * Derives environment variables from object storage access configuration
 * @param objectStorageObject - The complete object storage object containing access details
 * @returns An object containing environment variables for the object storage connection
 */
export const deriveObjectStorageEnvVariable = (
  objectStorageObject: ObjectStorageObject
) => {
  try {
    const { name: bucketName, access } = objectStorageObject;

    if (!access) {
      return null;
    }

    const { accessKey, secretKey, bucket, external, internal } = access;

    return {
      [`${bucketName.toUpperCase()}_ACCESS_KEY`]: accessKey,
      [`${bucketName.toUpperCase()}_SECRET_KEY`]: secretKey,
      [`${bucketName.toUpperCase()}_BUCKET`]: bucket,
      [`${bucketName.toUpperCase()}_EXTERNAL_ENDPOINT`]: external,
      [`${bucketName.toUpperCase()}_INTERNAL_ENDPOINT`]: internal,
    };
  } catch (error) {
    console.error(
      "Error deriving environment variables from object storage:",
      error
    );
    return null;
  }
};
