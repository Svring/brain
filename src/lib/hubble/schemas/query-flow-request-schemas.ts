import { z } from "zod";

// Define the schema for the query parameters
const QueryParamsSchema = z.object({
  name: z.string().nonempty(),
  ns: z.string().nonempty(),
  type: z.string().nonempty(),
  limit: z.coerce.number().int().positive(),
  min: z.coerce.number().int().nonnegative(),
});

// Export the schema
export { QueryParamsSchema };
