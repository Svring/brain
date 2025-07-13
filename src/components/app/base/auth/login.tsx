"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManualLogin from "./manual-login";
import PayloadLogin from "./payload-login";

export default function Login() {
  const [activeTab, setActiveTab] = useState<"development" | "deployment">(
    "development"
  );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center font-semibold text-foreground text-xl mb-6">
            Sealos Brain
          </h2>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "development" | "deployment")
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
            </TabsList>

            <TabsContent value="development" className="mt-0">
              <ManualLogin />
            </TabsContent>

            <TabsContent value="deployment" className="mt-0">
              <PayloadLogin />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
