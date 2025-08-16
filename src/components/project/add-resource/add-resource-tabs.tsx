"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddExistedResourceTab from "./add-existed-resource/add-existed-resource-tab";
import AddNewResourceTab from "./add-new-resource/add-new-resource-tab";

export default function AddResourceTabs() {
  return (
    <div className="w-full">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">Create New</TabsTrigger>
          <TabsTrigger value="existing">Add Existing</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <AddNewResourceTab />
        </TabsContent>

        <TabsContent value="existing" className="mt-6">
          <AddExistedResourceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
