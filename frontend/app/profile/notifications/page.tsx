"use client";

import { useContext } from "react";
import { userContext } from "@/context/userContext";
import UserNotifications from "@/components/profile/notifications/UserNotifications";
import AdminNotifications from "@/components/profile/notifications/AdminNotifications";

export default function NotificationsPage() {
  const { fullUserData } = useContext(userContext);

  if (!fullUserData) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return fullUserData.isAdmin ? <AdminNotifications /> : <UserNotifications />;
}
