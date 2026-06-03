"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getStatistics, StatisticsResponse } from "@/lib/api/statistics";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
}

const StatCard = ({ title, value, subValue }: StatCardProps) => (
  <Card className="rounded-none border border-black shadow-none h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </CardContent>
  </Card>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  }, []);

  const defaultTo = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(defaultTo);

  const fetchStats = useCallback(async () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
      toast.error("'From' date must be before 'To' date");
      return;
    }

    setLoading(true);
    try {
      const data = await getStatistics(from, to);
      setStats(data);
    } catch {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { title: "Total books amount", value: stats.totalBooksAmount, sub: "All time" },
      { title: "Total Members", value: stats.totalMembers, sub: "All time" },
      { title: "Books rented", value: stats.booksRented, sub: "Current" },
      { title: "Books in stock", value: stats.booksInStock, sub: "Current" },
      { title: "Most popular book", value: stats.mostPopularBook, sub: "All time" },
      { title: "User count", value: stats.userCount, sub: "Active in period" },
      { title: "New members", value: stats.newMembers, sub: "Joined in period" },
      { title: "New books", value: stats.newBooks, sub: "Added in period" },
      { title: "Most popular category", value: stats.mostPopularCategory, sub: "In period" },
      { title: "Return delayed", value: stats.returnDelayed, sub: "In period" },
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 p-4 border border-black">
        <div className="space-y-2">
          <Label htmlFor="from-date" className="text-xs uppercase font-bold">
            From
          </Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-none border-black h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-date" className="text-xs uppercase font-bold">
            To
          </Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-none border-black h-10"
          />
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card, i) => (
            <StatCard key={i} title={card.title} value={card.value} subValue={card.sub} />
          ))}
        </div>
      )}
    </div>
  );
}
