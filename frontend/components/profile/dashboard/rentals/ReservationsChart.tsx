"use client";

import { useMemo, useEffect, useState } from "react";
import { getReservationsChartData, ReservationChartData } from "@/lib/api/statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ReservationsChart() {
  const [data, setData] = useState<ReservationChartData[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    setMounted(true);
    getReservationsChartData().then(setData);
  }, []);

  const chartData = useMemo(() => {
    const months = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    return months.map(({ year, month }) => {
      const found = data.find((d) => d.year === year && d.month === month);
      const date = new Date(year, month - 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      return {
        name: `${monthName} ${year}`,
        Reservations: found ? found.count : 0,
      };
    });
  }, [data]);

  return (
    <Card className="rounded-none border border-black shadow-none mt-6">
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
          Monthly Reservations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {mounted ? (
            chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#000", color: "#fff", borderRadius: "0", border: "none" }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="Reservations" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No data available
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Loading chart...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
