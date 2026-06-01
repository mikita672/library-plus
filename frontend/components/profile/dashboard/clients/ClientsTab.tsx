"use client";

import { AdminUser, getAllUsers, getAllUsersPages } from "@/lib/api/users";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClientsTable from "./ClientsTable";

export default function ClientsTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchToken, setSearchToken] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchToken);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchToken]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [data, pages] = await Promise.all([
        getAllUsers(pageNumber, debouncedSearch),
        getAllUsersPages(debouncedSearch),
      ]);
      setUsers(data);
      setTotalPages(Math.max(1, pages));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, debouncedSearch]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPageNumber(1);
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
        <>
          <ClientsTable users={users} onRefresh={fetchData} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pageNumber} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
