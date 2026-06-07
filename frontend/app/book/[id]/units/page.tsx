"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { BookUnit } from "@/types/book/Book";
import { ReservationItem } from "@/types/reservation/Reservation";
import { getBookById, getBookUnitsForBook } from "@/lib/api/books";
import { getReservationsByUnit } from "@/lib/api/reservations";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UnitCondition = "Good" | "Minor damages" | "Lost" | "Destroyed";

const CONDITION_SEVERITY: Record<string, number> = {
  "Good": 0,
  "Minor damages": 1,
  "Lost": 2,
  "Destroyed": 3,
};

function deriveCondition(reservations: ReservationItem[]): UnitCondition {
  const returned = reservations.filter(r => r.bookConditionUponReturn);
  if (returned.length === 0) return "Good";

  let worst: UnitCondition = "Good";
  for (const r of returned) {
    const condition = r.bookConditionUponReturn!;
    const severity = CONDITION_SEVERITY[condition] ?? 0;
    if (severity > CONDITION_SEVERITY[worst]) {
      worst = condition as UnitCondition;
    }
  }
  return worst;
}

function ConditionBadge({ condition }: { condition: UnitCondition }) {
  const colorClasses: Record<UnitCondition, string> = {
    "Good": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    "Minor damages": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    "Lost": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    "Destroyed": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClasses[condition]}`}>
      {condition}
    </span>
  );
}

interface UnitWithCondition {
  unit: BookUnit;
  condition: UnitCondition;
  reservationCount: number;
}

export default function BookUnitsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookId } = use(params);
  const [bookTitle, setBookTitle] = useState("");
  const [units, setUnits] = useState<UnitWithCondition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [book, bookUnits] = await Promise.all([
          getBookById(bookId),
          getBookUnitsForBook(bookId),
        ]);
        setBookTitle(book.title);

        const reservationsByUnit = await Promise.all(
          bookUnits.map(u => getReservationsByUnit(u.id))
        );

        const enriched: UnitWithCondition[] = bookUnits.map((unit, i) => ({
          unit,
          condition: deriveCondition(reservationsByUnit[i]),
          reservationCount: reservationsByUnit[i].length,
        }));

        setUnits(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  return (
    <div className="w-full bg-card p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/book/${bookId}`}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{bookTitle || "Book Units"}</h1>
          <p className="text-sm text-muted-foreground">
            {units.length} {units.length === 1 ? "unit" : "units"} registered
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading units...</div>
      ) : units.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No units found for this book.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit ID</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Total Rentals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map(({ unit, condition, reservationCount }) => (
              <TableRow key={unit.id}>
                <TableCell className="font-mono text-xs">{unit.id.substring(0, 8)}</TableCell>
                <TableCell><ConditionBadge condition={condition} /></TableCell>
                <TableCell>{reservationCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
