import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <LoadingScreen text="Loading..." />
    </div>
  );
}
