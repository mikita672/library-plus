"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { userContext } from "@/context/userContext";

function DangerZone() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useContext(userContext);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/me", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Failed to delete account");
        return;
      }

      await logout();
      router.push("/login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Danger zone</h2>

      <h2
        className="cursor-pointer text-red-500 underline"
        onClick={handleDeleteAccount}
      >
        {loading ? "Deleting..." : "Delete account"}
      </h2>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

export default DangerZone;
