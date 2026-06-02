"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { useClients } from "@/hooks/useClients";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClientsTable from "./ClientsTable";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function ClientsTab() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [pageNumber, setPageNumber] = useState(1);
  const [searchToken, setSearchToken] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchToken, 300);

  const { users, loading, error, totalPages, refetch } = useClients(
    pageNumber,
    debouncedSearch,
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPageNumber(1);
    });
    return () => cancelAnimationFrame(frame);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4 max-w-md">
        <div className="space-y-2 flex-1">
          <Label>Search clients</Label>
          <Input
            placeholder="Search by name or email..."
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8">Failed to fetch users</div>
      ) : (
        <div className="min-h-[600px] flex flex-col justify-between">
          <ClientsTable users={users} onRefresh={refetch} />
          <PaginationControls
            pageNumber={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
          />
        </div>
      )}
    </div>
  );
}
