import { z } from "zod";

export const DevboxApiContextSchema = z.object({
  baseUrl: z.string().optional(),
  authorization: z.string().optional(),
  authorizationBearer: z.string().optional(),
});

export type DevboxApiContext = z.infer<typeof DevboxApiContextSchema>;
