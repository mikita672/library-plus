import { useCallback, useEffect, useState } from "react";
import { AdminUser, getAllUsers, getAllUsersPages } from "@/lib/api/users";

export function useClients(pageNumber: number, searchToken: string) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [data, pages] = await Promise.all([
        getAllUsers(pageNumber, searchToken),
        getAllUsersPages(searchToken),
      ]);
      setUsers(data);
      setTotalPages(Math.max(1, pages));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchToken]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { users, loading, error, totalPages, refetch: fetchData };
}
