"use client";

import { useCallback, useEffect, useState } from "react";
import { getStatistics, StatisticsResponse } from "@/lib/api/statistics";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardOverview() {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        toast.error("'From' date must be before 'To' date");
        setLoading(false);
        return;
      }

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

  const StatCard = ({ title, value, subValue }: { title: string; value: string | number; subValue?: string }) => (
    <Card className="rounded-none border border-black shadow-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 p-4 border border-black">
        <div className="space-y-2">
          <Label htmlFor="from-date" className="text-xs uppercase font-bold">From</Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-none border-black h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-date" className="text-xs uppercase font-bold">To</Label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-l border-t border-black">
          <div className="border-r border-b border-black">
            <StatCard title="Total books amount" value={stats?.totalBooksAmount ?? 0} subValue="All time" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="Total Members" value={stats?.totalMembers ?? 0} subValue="All time" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="Books rented" value={stats?.booksRented ?? 0} subValue="Current" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="Books in stock" value={stats?.booksInStock ?? 0} subValue="Current" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="Most popular book" value={stats?.mostPopularBook ?? "N/A"} subValue="All time" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="User count" value={stats?.userCount ?? 0} subValue="Active in period" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="New members" value={stats?.newMembers ?? 0} subValue="Joined in period" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="New books" value={stats?.newBooks ?? 0} subValue="Added in period" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="Most popular category" value={stats?.mostPopularCategory ?? "N/A"} subValue="In period" />
          </div>
          <div className="border-r border-b border-black">
            <StatCard title="Return delayed" value={stats?.returnDelayed ?? 0} subValue="In period" />
          </div>
        </div>
      )}
    </div>
  );
}
