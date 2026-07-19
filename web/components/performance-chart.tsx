"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyPerformanceChart({
  data
}: {
  data: Array<{ month: string; strategy: number; benchmark: number }>;
}) {
  return (
    <div className="h-72 w-full rounded border border-line bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#eee7dc" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="strategy" stroke="#1f3a33" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="benchmark" stroke="#a55f45" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function YearlyReturnChart({
  data
}: {
  data: Array<{ year: string; strategy: number; benchmark: number }>;
}) {
  return (
    <div className="h-72 w-full rounded border border-line bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#eee7dc" />
          <XAxis dataKey="year" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="strategy" fill="#1f3a33" radius={[4, 4, 0, 0]} />
          <Bar dataKey="benchmark" fill="#c39b43" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
