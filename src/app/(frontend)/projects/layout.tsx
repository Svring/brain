import { cookies } from "next/headers";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { listTemplates } from "@/lib/sealos/template/template-api/template-old-api";
import { runParallelAction } from "next-server-actions-parallel";

const createSealosContext = async () => {
  const cookieStore = await cookies();
  const kubeconfig = cookieStore.get("kubeconfig")?.value as string;
  const regionUrl = cookieStore.get("regionUrl")?.value as string;
  return SealosApiContextSchema.parse({
    baseUrl: regionUrl,
    authorization: encodeURIComponent(kubeconfig),
  });
};

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
