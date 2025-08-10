import { cookies } from "next/headers";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "project-name": string }>;
}) {
  const queryClient = new QueryClient();
  const { "project-name": projectName } = await params;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
