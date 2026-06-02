"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { returnReservation } from "@/lib/api/reservations";
import { EnrichedReservationItem } from "@/types/reservation/Reservation";

interface Props {
  reservation: EnrichedReservationItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CONDITIONS = ["Brand New", "Good", "Fair", "Lost/Destroyed"];

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const dateSchema = z
  .string()
  .regex(
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/,
    "Dates must be in DD/MM/YYYY format",
  );

const rentalSchema = z
  .object({
    startDateStr: dateSchema,
    endDateStr: dateSchema,
    condition: z.string(),
    note: z.string(),
  })
  .refine(
    (data) => {
      const parseDate = (str: string) => {
        const parts = str.split("/");
        return new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0]),
        );
      };
      const start = parseDate(data.startDateStr);
      const end = parseDate(data.endDateStr);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
      return start.getTime() <= end.getTime();
    },
    {
      message: "'From' date cannot be greater than 'To' date",
      path: ["startDateStr"],
    },
  );

type FormValues = z.infer<typeof rentalSchema>;

export function ManageRentalDialog({ reservation, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      startDateStr: "",
      endDateStr: "",
      condition: "Good",
      note: "",
    },
  });

  useEffect(() => {
    if (reservation) {
      form.reset({
        startDateStr: formatDate(reservation.startDate),
        endDateStr: formatDate(reservation.endDate),
        condition: reservation.bookConditionUponReturn || "Good",
        note: reservation.additionalNote || "",
      });
    }
  }, [reservation, form]);

  if (!reservation) return null;

  const { startDateStr, endDateStr, condition } = form.watch();

  const parseDateStr = (dateStr: string, fallbackIso: string) => {
    try {
      if (!dateStr) return new Date(fallbackIso);
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const d = new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0]),
        );
        if (!isNaN(d.getTime())) return d;
      }
    } catch {}
    return new Date(fallbackIso);
  };

  const startDate = parseDateStr(startDateStr, reservation.startDate);
  const endDate = parseDateStr(endDateStr, reservation.endDate);
  const now = new Date();

  const totalDays = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)),
  );

  let overdueDays = 0;
  if (
    reservation.status === "Overdue" ||
    (reservation.status !== "Returned" && now > endDate)
  ) {
    overdueDays = Math.max(
      0,
      Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 3600 * 24)),
    );
  }

  const overdueFine = overdueDays * 1;
  const conditionFine =
    condition === "Lost/Destroyed" ? reservation.repurchasePrice : 0;
  const totalFine = overdueFine + conditionFine;

  const handleDateChange = (val: string, onChange: (v: string) => void) => {
    onChange(val.replace(/[^\d/]/g, ""));
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    const partsStart = data.startDateStr.split("/");
    const startObj = new Date(
      Number(partsStart[2]),
      Number(partsStart[1]) - 1,
      Number(partsStart[0]),
    );

    const partsEnd = data.endDateStr.split("/");
    const endObj = new Date(
      Number(partsEnd[2]),
      Number(partsEnd[1]) - 1,
      Number(partsEnd[0]),
    );

    try {
      await returnReservation(reservation.id, {
        bookConditionUponReturn: data.condition,
        additionalNote: data.note,
        startDate: startObj.toISOString(),
        endDate: endObj.toISOString(),
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!reservation} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl sm:max-w-4xl rounded-none border-none p-8">
        <DialogHeader className="hidden">
          <DialogTitle>Manage Rental</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2"
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{reservation.bookTitle}</h2>
            <div className="text-sm space-y-1">
              <p>id: {reservation.bookUnitId.substring(0, 8)}</p>
              <p>Author: {reservation.bookAuthor}</p>
              <p>Language: {reservation.bookLanguage}</p>
              <p>Year of publication: {reservation.bookYear}</p>
            </div>
            {reservation.bookCoverUri && (
              <div className="mt-4 overflow-hidden relative w-[200px] h-[300px]">
                <Image
                  src={
                    reservation.bookCoverUri.startsWith("http")
                      ? reservation.bookCoverUri
                      : `http://localhost:5032${reservation.bookCoverUri}`
                  }
                  alt={reservation.bookTitle}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Rental period</h3>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="startDateStr"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-1">
                      <Label>From</Label>
                      <Input
                        value={field.value}
                        onChange={(e) =>
                          handleDateChange(e.target.value, field.onChange)
                        }
                        placeholder="DD/MM/YYYY"
                        className="rounded-none bg-transparent"
                      />
                      {form.formState.errors.startDateStr && (
                        <p className="text-destructive text-xs font-medium">
                          {form.formState.errors.startDateStr.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="endDateStr"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-1">
                      <Label>To</Label>
                      <Input
                        value={field.value}
                        onChange={(e) =>
                          handleDateChange(e.target.value, field.onChange)
                        }
                        placeholder="DD/MM/YYYY"
                        className="rounded-none bg-transparent"
                      />
                      {form.formState.errors.endDateStr && (
                        <p className="text-destructive text-xs font-medium">
                          {form.formState.errors.endDateStr.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="text-sm space-y-1 mt-4">
                <p>
                  Due date:{" "}
                  {endDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <p>Total rental time: {totalDays} days</p>
                <p>
                  <span className="font-semibold">Overdue time:</span>{" "}
                  {overdueDays > 0 ? `${overdueDays} days` : "none"}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-transparent">
              <h3 className="font-bold text-lg">Rental details</h3>
              <div className="space-y-2 flex items-center gap-4">
                <Label>Book condition:</Label>
                <Controller
                  name="condition"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px] rounded-none bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional note:</Label>
                <Controller
                  name="note"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Enter additional noted regarding this rental"
                      value={field.value}
                      onChange={field.onChange}
                      className="min-h-[120px] resize-none rounded-none bg-transparent"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8 flex flex-col h-full">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Client info</h3>
              <div className="text-sm space-y-1">
                <Link
                  href={`/profile/dashboard/clients?search=${encodeURIComponent(reservation.clientEmail)}`}
                  className="text-primary underline hover:opacity-80 block mb-2"
                >
                  {reservation.clientName}
                </Link>
                <p>Email: {reservation.clientEmail}</p>
                <p>Phone: {reservation.clientPhone}</p>
              </div>
            </div>

            <div className="mt-auto space-y-6">
              <div className="text-right">
                <h3 className="font-bold text-lg mb-2">Fines details</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Overdue: ${overdueFine}</p>
                  <p>Unusable book condition: ${conditionFine}</p>
                  <p className="font-semibold mt-1">Total: ${totalFine}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {form.formState.errors.root && (
                  <p className="text-destructive text-sm font-medium mb-1">
                    {form.formState.errors.root.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full py-6 text-lg rounded-none shadow-none"
                  disabled={loading}
                >
                  {totalFine > 0 ? "Request payment" : "Process return"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 text-lg rounded-none"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
