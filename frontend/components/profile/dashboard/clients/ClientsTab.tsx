"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { useClients } from "@/hooks/useClients";

import { Input } from "@/components/ui/input";
import ClientsTable from "./ClientsTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export default function ClientsTab() {
  const searchParams = useSearchParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(inputValue, 500);

  const { users, totalPages, loading, error, refetch } = useClients(
    pageNumber,
    debouncedSearch,
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPageNumber(1);
    });
    return () => cancelAnimationFrame(frame);
  }, [debouncedSearch]);

  const handleClear = () => {
    setInputValue("");
    setPageNumber(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 max-w mr-4 gap-2">
          <Input
            className="h-10 text-base"
            placeholder="Search clients by name or email..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button variant="outline" className="h-10 w-10 p-0 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8">Error loading clients</div>
      ) : (
        <div className="min-h-150 flex flex-col justify-between">
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
