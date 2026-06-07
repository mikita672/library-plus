"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserNotifications from "./UserNotifications";
import SendNotificationForm from "./SendNotificationForm";

function AdminNotificationsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "notifications";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="send">Send Notification</TabsTrigger>
      </TabsList>

      <TabsContent value="notifications">
        <UserNotifications />
      </TabsContent>

      <TabsContent value="send">
        <SendNotificationForm />
      </TabsContent>
    </Tabs>
  );
}

export default function AdminNotifications() {
  return (
    <section className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AdminNotificationsTabs />
      </Suspense>
    </section>
  );
}
