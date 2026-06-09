"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
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

const CONDITIONS = ["Good", "Minor damages", "Lost", "Destroyed"];

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

const rentalSchema = z.object({
  condition: z.string(),
  note: z.string(),
});

type FormValues = z.infer<typeof rentalSchema>;

export function ManageRentalDialog({ reservation, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(rentalSchema),
    defaultValues: { condition: "Good", note: "" },
  });

  useEffect(() => {
    if (reservation) {
      form.reset({
        condition: reservation.bookConditionUponReturn || "Good",
        note: reservation.additionalNote || "",
      });
    }
  }, [reservation, form]);

  const { condition } = form.watch();

  const dates = useMemo(() => {
    if (!reservation) return { s: new Date(), e: new Date() };
    return {
      s: new Date(reservation.startDate),
      e: new Date(reservation.endDate),
    };
  }, [reservation]);

  if (!reservation) return null;

  const totalDays = Math.max(1, Math.ceil((dates.e.getTime() - dates.s.getTime()) / 86400000));
  const overdueDays = (reservation.status === "Overdue" || (reservation.status !== "Returned" && new Date() > dates.e))
    ? Math.max(0, Math.ceil((new Date().getTime() - dates.e.getTime()) / 86400000)) : 0;

  const overdueFine = overdueDays * 1;
  const conditionFine = (condition === "Lost" || condition === "Destroyed") 
    ? reservation.repurchasePrice 
    : condition.toLowerCase().includes("minor") 
      ? reservation.repurchasePrice / 3 
      : 0;
  const totalFine = overdueFine + conditionFine;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await returnReservation(reservation.id, {
        bookConditionUponReturn: values.condition,
        additionalNote: values.note,
      });
      onSuccess();
      onClose();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <Dialog open={!!reservation} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-5xl w-[95vw] rounded-none border-none p-8">
        <DialogHeader className="hidden"><DialogTitle>Manage</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{reservation.bookTitle}</h2>
            <div className="text-sm space-y-1">
              <p>id: {reservation.bookUnitId.substring(0, 8)}</p>
              <p>Author: {reservation.bookAuthor}</p>
              <p>Language: {reservation.bookLanguage}</p>
              <p>Year: {reservation.bookYear}</p>
            </div>
            {reservation.bookCoverUri && (
              <div className="mt-4 relative w-50 h-75 overflow-hidden">
                <Image src={reservation.bookCoverUri} alt={reservation.bookTitle} fill sizes="200px" className="object-cover" unoptimized />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Rental period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>From</Label>
                  <Input value={formatDate(reservation.startDate)} readOnly disabled className="rounded-none" />
                </div>
                <div className="space-y-1">
                  <Label>To</Label>
                  <Input value={formatDate(reservation.endDate)} readOnly disabled className="rounded-none" />
                </div>
              </div>
              <div className="text-sm space-y-1 mt-4">
                <p>Due: {dates.e.toLocaleDateString("en-GB")}</p>
                <p>Total: {totalDays} days</p>
                <p><span className="font-semibold">Overdue:</span> {overdueDays || "none"}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-transparent">
              <h3 className="font-bold text-lg">Details</h3>
              <div className="space-y-2 flex items-center gap-4">
                <Label>Condition:</Label>
                <Controller name="condition" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-45 rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2 mt-4">
                <Label>Note:</Label>
                <Controller name="note" control={form.control} render={({ field }) => (
                  <Textarea {...field} placeholder="Notes..." className="min-h-30 resize-none rounded-none" />
                )} />
              </div>
            </div>
          </div>

          <div className="space-y-8 flex flex-col">
            <div>
              <h3 className="font-bold text-lg">Client</h3>
              <Link href={`/profile/dashboard/clients?search=${encodeURIComponent(reservation.clientEmail)}`} className="text-primary underline block mb-2">{reservation.clientName === "Unknown" ? reservation.clientEmail : reservation.clientName}</Link>
              {reservation.clientName !== "Unknown" && reservation.clientName !== reservation.clientEmail && reservation.clientEmail && (
                <p className="text-sm"><span className="font-medium">Email:</span> {reservation.clientEmail}</p>
              )}
              <p className="text-sm"><span className="font-medium">Phone:</span> {reservation.clientPhone}</p>
            </div>
            <div className="mt-auto space-y-6">
              <div className="text-right">
                <h3 className="font-bold text-lg mb-2">Fines</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Overdue: ${overdueFine}</p>
                  <p>Condition: ${conditionFine}</p>
                  <p className="font-semibold text-foreground">Total: ${totalFine}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" size="sm" className="w-full" disabled={loading}>{totalFine > 0 ? "Request payment" : "Return"}</Button>
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={onClose} disabled={loading}>Cancel</Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
