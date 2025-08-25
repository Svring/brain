/**
 * Generates a random string of lowercase alphabets
 * @param length - The length of the random string (default: 5)
 * @returns A random string of lowercase alphabets
 */
function generateRandomString(length: number = 5): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
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
export const generateBucketName = (prefix: string = "bucket"): string => {
  const randomString = generateRandomString(5);
  return `${prefix}-${randomString}`;
};

/**
 * Maps bucket policy strings to supported API policy enums
 * @param policy - The policy string to map
 * @returns The mapped policy enum for API calls
 */
export const mapBucketPolicyToEnum = (
  policy: string
): "private" | "publicRead" | "publicReadWrite" => {
  const policyMap: Record<
    string,
    "private" | "publicRead" | "publicReadWrite"
  > = {
    private: "private",
    Private: "private",
    public: "publicRead",
    publicread: "publicRead",
    PublicRead: "publicRead",
    publicreadwrite: "publicReadWrite",
    PublicReadwrite: "publicReadWrite",
    "public-read": "publicRead",
    "public-read-write": "publicReadWrite",
  };
  return policyMap[policy] || "private"; // Default to private if no match
};
