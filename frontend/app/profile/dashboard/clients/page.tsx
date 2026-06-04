import { Suspense } from "react";
import ClientsTab from "@/components/profile/dashboard/clients/ClientsTab";

export default function DashboardClientsPage() {
  return (
    <section className="space-y-4">
      <Suspense fallback={<div>Loading clients...</div>}>
        <ClientsTab />
      </Suspense>
    </section>
  );
}
