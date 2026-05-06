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
import type { Address } from "@/types/user/UserData";

const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{2}-\d{3}$/, "Postal code must be in format XX-XXX");

type Props = {
  address: Address;
  onSuccess: () => void;
};

export default function ChangeAddressPopover({ address, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(address.city ?? "");
  const [street, setStreet] = useState(address.street ?? "");
  const [buildingNumber, setBuildingNumber] = useState(
    address.buildingNumber ?? "",
  );
  const [postalCode, setPostalCode] = useState(address.postalCode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCity(address.city ?? "");
      setStreet(address.street ?? "");
      setBuildingNumber(address.buildingNumber ?? "");
      setPostalCode(address.postalCode ?? "");
      setError(null);
      setPostalCodeError(null);
    }
  }, [open, address]);

  const handleSave = async () => {
    setError(null);
    setPostalCodeError(null);

    const postalValidation = postalCodeSchema.safeParse(postalCode);
    if (!postalValidation.success) {
      setPostalCodeError(
        postalValidation.error.issues[0]?.message ?? "Invalid postal code",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/updateAddress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          city,
          street,
          buildingNumber,
          postalCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Failed to update address");
        return;
      }

      setOpen(false);
      onSuccess();
    } catch {
      setError("Network error");
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

      <PopoverContent className="w-96 rounded-none border border-border bg-background p-4">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Change delivery address</div>

          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
          />
          <Input
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Street"
          />
          <Input
            value={buildingNumber}
            onChange={(e) => setBuildingNumber(e.target.value)}
            placeholder="Building number"
          />
          <Input
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value);
              setPostalCodeError(null);
            }}
            placeholder="Postal code"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {postalCodeError ? (
            <p className="text-sm text-red-600">{postalCodeError}</p>
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
