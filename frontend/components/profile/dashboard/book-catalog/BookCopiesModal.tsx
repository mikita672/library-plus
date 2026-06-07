"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBookUnitsForBook } from "@/lib/api/books";
import { getReservationsByUnit } from "@/lib/api/reservations";
import { BookUnit, BookCard } from "@/types/book/Book";

interface BookUnitStatus {
  unit: BookUnit;
  condition: string;
  isAvailable: boolean;
}

interface Props {
  book: BookCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookCopiesModal({ book, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [unitsStatus, setUnitsStatus] = useState<BookUnitStatus[]>([]);

  useEffect(() => {
    if (!book || !open) return;

    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const units = await getBookUnitsForBook(book!.id);
        const statuses = await Promise.all(units.map(async (unit) => {
          const reservations = await getReservationsByUnit(unit.id);
          const latestReturn = reservations.find(r => r.returnedDate !== null);
          const activeReservation = reservations.find(r => r.returnedDate === null);
          
          let condition = "Good";
          if (latestReturn && latestReturn.bookConditionUponReturn) {
            condition = latestReturn.bookConditionUponReturn;
          }

          return {
            unit,
            condition,
            isAvailable: !activeReservation
          };
        }));

        if (mounted) {
          setUnitsStatus(statuses);
        }
      } catch (err) {
        console.error("Failed to fetch copies", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchData();

    return () => {
      mounted = false;
    };
  }, [book, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Copies for &quot;{book?.title}&quot;</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading copies...</div>
        ) : unitsStatus.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No copies found for this book.</div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitsStatus.map((s) => (
                  <TableRow key={s.unit.id}>
                    <TableCell className="font-mono text-xs">{s.unit.id}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        s.condition.toLowerCase() === "good" ? "bg-green-100 text-green-800" :
                        s.condition.toLowerCase().includes("minor") ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {s.condition}
                      </span>
                    </TableCell>
                    <TableCell>
                      {s.isAvailable ? (
                        <span className="text-green-600 font-medium">Available</span>
                      ) : (
                        <span className="text-destructive font-medium">Rented</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
