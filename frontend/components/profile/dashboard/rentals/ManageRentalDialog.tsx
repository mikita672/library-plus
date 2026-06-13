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
import { getReservationsByUnit, returnReservation } from "@/lib/api/reservations";
import { EnrichedReservationItem, ReservationItem } from "@/types/reservation/Reservation";

interface Props {
  reservation: EnrichedReservationItem | null;
  onClose: () => void;
  onSuccess: () => void;
  readOnly?: boolean;
  hideClientDetails?: boolean;
}

const CONDITIONS = ["Good", "Minor damages", "Unusable", "Lost"];

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

const rentalSchema = z.object({
  condition: z.string(),
  note: z.string(),
});

type FormValues = z.infer<typeof rentalSchema>;

export function ManageRentalDialog({ reservation, onClose, onSuccess, readOnly, hideClientDetails }: Props) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ReservationItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
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
      getReservationsByUnit(reservation.bookUnitId).then((data) => {
        const pastReturns = data.filter(r => r.id !== reservation.id && r.status.toLowerCase() === "returned");
        setHistory(pastReturns);
      });
    } else {
      setHistory([]);
      setShowHistory(false);
    }
  }, [reservation, form, readOnly]);

  const hasMinorDamages = history.some(r => r.bookConditionUponReturn?.toLowerCase().includes("minor"));

  const { condition } = form.watch();

  const dates = useMemo(() => {
    if (!reservation) { return { s: new Date(), e: new Date() }; }
    return {
      s: new Date(reservation.startDate),
      e: new Date(reservation.endDate),
    };
  }, [reservation]);

  if (!reservation) { return null; }

  const totalDays = Math.max(1, Math.ceil((dates.e.getTime() - dates.s.getTime()) / 86400000));
  const overdueDays = (reservation.status === "Overdue" || (reservation.status !== "Returned" && new Date() > dates.e))
    ? Math.max(0, Math.ceil((new Date().getTime() - dates.e.getTime()) / 86400000)) : 0;

  const overdueFine = overdueDays * 1;
  const conditionFine = Math.round(((condition === "Lost" || condition === "Unusable" || condition === "Destroyed")
    ? reservation.repurchasePrice
    : condition.toLowerCase().includes("minor")
      ? reservation.repurchasePrice / 3
      : 0) * 100) / 100;

  const totalFine = Math.round((overdueFine + conditionFine) * 100) / 100;

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
      <DialogContent className="sm:max-w-5xl w-[95vw] rounded-none border-none p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="hidden"><DialogTitle>Manage</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{reservation.bookTitle}</h2>
            <div className="text-sm space-y-1">
              <p>id: {reservation.bookUnitId}</p>
              <p>Author: {reservation.bookAuthor}</p>
              <p>Language: {reservation.bookLanguage}</p>
              <p>Year: {reservation.bookYear}</p>
              {hasMinorDamages && (
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Warning: Previously marked as minor damages
                </div>
              )}
              {history.some(h => h.additionalNote) && !readOnly && (
                <div className="mt-2">
                  <Button type="button" variant="link" className="px-0 h-auto text-xs" onClick={() => setShowHistory(true)}>
                    See previous return notes ({history.filter(h => h.additionalNote).length})
                  </Button>
                </div>
              )}
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
                  <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                    <SelectTrigger className="w-45 rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2 mt-4">
                <Label>Note:</Label>
                <Controller name="note" control={form.control} render={({ field }) => (
                  <Textarea {...field} placeholder="Notes..." className="min-h-30 resize-none rounded-none" disabled={readOnly} />
                )} />
              </div>
            </div>
          </div>

          <div className="space-y-8 flex flex-col">
            {!hideClientDetails && (reservation.clientName !== "Unknown" || reservation.clientEmail || reservation.clientPhone) && (
              <div>
                <h3 className="font-bold text-lg mb-4">Client</h3>
                <div className="flex items-center gap-4">
                  {reservation.clientAvatarUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border">
                      <Image
                        src={reservation.clientAvatarUrl}
                        alt={reservation.clientName || "Avatar"}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted border">
                      <span className="text-muted-foreground font-semibold">
                        {reservation.clientName && reservation.clientName !== "Unknown" ? reservation.clientName.charAt(0).toUpperCase() : "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <Link href={`/profile/dashboard/clients?search=${encodeURIComponent(reservation.clientEmail || "")}`} className="text-primary underline block mb-1">{reservation.clientName === "Unknown" ? reservation.clientEmail : reservation.clientName}</Link>
                    {reservation.clientName !== "Unknown" && reservation.clientName !== reservation.clientEmail && reservation.clientEmail && (
                      <p className="text-sm"><span className="font-medium">Email:</span> {reservation.clientEmail}</p>
                    )}
                    {reservation.clientPhone && reservation.clientPhone !== "Unknown" && (
                      <p className="text-sm"><span className="font-medium">Phone:</span> {reservation.clientPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-auto space-y-6">
              <div className="text-right">
                <h3 className="font-bold text-lg mb-2">Fines</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Overdue: ${overdueFine.toFixed(2)}</p>
                  <p>Condition: ${conditionFine.toFixed(2)}</p>
                  <p className="font-semibold text-foreground">Total: ${totalFine.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!readOnly && <Button type="submit" size="sm" className="w-full" disabled={loading}>{totalFine > 0 ? "Confirm payment" : "Return"}</Button>}
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={onClose} disabled={loading}>{readOnly ? "Close" : "Cancel"}</Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle>Previous Return Notes</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
            {history.filter(h => h.additionalNote).map(h => (
              <div key={h.id} className="border p-3 text-sm space-y-1">
                <p className="font-semibold text-xs text-muted-foreground">{formatDate(h.returnedDate || h.endDate)}</p>
                <p><span className="font-medium">Condition:</span> {h.bookConditionUponReturn || "N/A"}</p>
                <p><span className="font-medium">Note:</span> {h.additionalNote}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button type="button" variant="outline" onClick={() => setShowHistory(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
