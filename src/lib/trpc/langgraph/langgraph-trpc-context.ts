import { z } from "zod";

export const LanggraphContextSchema = z.object({
  kubeconfig: z.string().optional(),
});

export type LanggraphContext = z.infer<typeof LanggraphContextSchema>;

export async function createLanggraphContext(opts: {
  req: Request;
}): Promise<LanggraphContext> {
  const kubeconfig = opts.req.headers.get("kubeconfig");

  return {
    kubeconfig: kubeconfig || undefined,
  };
}
