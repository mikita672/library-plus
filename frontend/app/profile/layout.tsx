import Sidebar from "@/components/profile/sidebar";
import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
