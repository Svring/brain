import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <ProjectProvider> */}
      {children}
      {/* </ProjectProvider> */}
    </HydrationBoundary>
  );
}
