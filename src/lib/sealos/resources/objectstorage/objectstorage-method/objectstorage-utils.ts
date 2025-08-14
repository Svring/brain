/**
 * Generates a random string of lowercase alphabets
 * @param length - The length of the random string (default: 5)
 * @returns A random string of lowercase alphabets
 */
function generateRandomString(length: number = 5): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates an automatic name for an object storage bucket resource
 * @param prefix - Optional prefix for the name (default: 'bucket')
 * @returns A generated name in the format 'bucket-XXXXX' where XXXXX is random lowercase alphabets
 */
export const generateBucketName = (prefix: string = 'bucket'): string => {
  const randomString = generateRandomString(5);
  return `${prefix}-${randomString}`;
};
