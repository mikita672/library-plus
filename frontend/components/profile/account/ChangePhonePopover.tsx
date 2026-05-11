"use client";

import { useEffect, useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { z } from "zod";
import { toast } from "sonner";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$/, "Phone number must be exactly 9 digits");

type Props = {
  phoneNumber: string | null;
  onSuccess: () => void;
};

export default function ChangePhonePopover({ phoneNumber, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(phoneNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPhone(phoneNumber ?? "");
      setError(null);
      setValidationError(null);
    }
  }, [open, phoneNumber]);

  const handleSave = async () => {
    const validation = phoneSchema.safeParse(phone);
    if (!validation.success) {
      setValidationError(
        validation.error.issues[0]?.message ?? "Invalid phone number",
      );
      return;
    }

    setValidationError(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/updatePhoneNumber", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newPhoneNumber: phone }),
      });

      if (!response.ok) {
        let errorMsg = `Request failed (${response.status})`;
        try {
          const data = await response.json();
          errorMsg = data?.message || data?.error || errorMsg;
        } catch {
          errorMsg = response.statusText || errorMsg;
        }
        console.error("Phone update error:", errorMsg);
        setError(errorMsg);
        return;
      }

      setOpen(false);
      toast.success("Phone number changed successfully");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      console.error("Phone update exception:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-contrast px-1.5 py-0.5 cursor-pointer"
        >
          <PencilSimpleIcon size={18} />
          <span>Edit</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 rounded-none border border-border bg-background p-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold">Change phone number</div>
            <div className="text-xs text-muted-foreground">
              Update your contact number and save the changes.
            </div>
          </div>

          <Input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setValidationError(null);
            }}
            placeholder="New phone number"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {validationError ? (
            <p className="text-sm text-red-600">{validationError}</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
