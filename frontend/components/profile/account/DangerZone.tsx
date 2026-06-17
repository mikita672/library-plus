"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { userContext } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

function DangerZone() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useContext(userContext);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (loading) {
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/me", {
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

      setOpen(false);
      toast.success("Account deleted successfully");
      await logout();
      router.push("/login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-2">
      <h2 className="mb-4 text-xl font-semibold">Danger zone</h2>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="cursor-pointer text-red-500 underline hover:opacity-80"
          >
            Delete account
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-96 rounded-none border border-border bg-background p-4">
          <div className="space-y-3">
            <div className="text-sm font-semibold">Delete account</div>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. Your account and all associated data
              will be permanently deleted.
            </p>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </section>
  );
}

export default DangerZone;
