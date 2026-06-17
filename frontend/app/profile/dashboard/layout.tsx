"use client";

import { userContext } from "@/context/userContext";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData, fullUserData, isLoading } = useContext(userContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (userData === null) {
        router.push("/login");
      } else if (fullUserData !== null) {
        if (!fullUserData.isAdmin) {
          router.push("/profile");
        }
      }
    }
  }, [isLoading, userData, fullUserData, router]);

  if (isLoading || !userData || !fullUserData || !fullUserData.isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Checking access...</div>;
  }

  return <>{children}</>;
}
