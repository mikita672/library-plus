"use client";

import Sidebar from "@/components/profile/sidebar";
import { userContext } from "@/context/userContext";
import { usePathname } from "next/navigation";
import React from "react";
import { useContext, useEffect } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { refreshFullUser } = useContext(userContext);

  useEffect(() => {
    void refreshFullUser();
  }, [pathname, refreshFullUser]);

  return (
    <section className="flex  bg-card py-4">
      <div className="flex w-full gap-8 px-6">
        <aside className="shrink-0 w-3xs">
          <Sidebar />
        </aside>
        <main className="min-w-0 flex-1 bg-background px-10 py-8">
          {children}
        </main>
      </div>
    </section>
  );
}
