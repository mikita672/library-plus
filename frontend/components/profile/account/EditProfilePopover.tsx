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
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  phone: z.string().trim().regex(/^\d{9}$/, "Phone number must be exactly 9 digits"),
});

type Props = {
  currentName: string | null;
  currentPhone: string | null;
  onSuccess: () => void;
};

export default function EditProfilePopover({ currentName, currentPhone, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName ?? "");
  const [phone, setPhone] = useState(currentPhone ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string } | null>(null);

  useEffect(() => {
    if (open) {
      setName(currentName ?? "");
      setPhone(currentPhone ?? "");
      setErrors(null);
    }
  }, [open, currentName, currentPhone]);

  const handleSave = async () => {
    const validation = profileSchema.safeParse({ name, phone });
    if (!validation.success) {
      const fieldErrors: { name?: string; phone?: string } = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as "name" | "phone";
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors(null);
    setLoading(true);

    try {
      const response = await fetch("/api/users/updateProfile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, phoneNumber: phone }),
      });

      if (!response.ok) {
        toast.error(`Update failed (${response.status})`);
        return;
      }

      setOpen(false);
      toast.success("Profile updated successfully");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
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
          <span>Edit Profile</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 rounded-none border border-border bg-background p-4">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold">Edit Account Info</div>
            <div className="text-xs text-muted-foreground">
              Update your name and contact number.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-xs uppercase font-bold">Display Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors?.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Your name"
            />
            {errors?.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="text-xs uppercase font-bold">Phone Number</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors?.phone) setErrors({ ...errors, phone: undefined });
              }}
              placeholder="9 digits"
            />
            {errors?.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
