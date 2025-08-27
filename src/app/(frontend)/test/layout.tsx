import { ReactNode } from "react";

interface CenteredLayoutProps {
  children: ReactNode;
}

export default function CenteredLayout({ children }: CenteredLayoutProps) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4">
      {children}
    </div>
  );
}
