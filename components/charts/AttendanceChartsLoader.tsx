"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const LazyAttendanceCharts = dynamic(
  () => import("@/components/charts/AttendanceCharts").then((mod) => mod.AttendanceCharts),
  {
    ssr: false,
    loading: () => (
      <section className="card">
        <LoadingSpinner center label="Birimo gufungura imibare y'ubwitabire..." />
      </section>
    )
  }
);

export function AttendanceChartsLoader({
  sabbathData,
  monthlyTrend
}: {
  sabbathData: { label: string; present: number; absent: number }[];
  monthlyTrend: { month: string; attendance: number }[];
}) {
  return <LazyAttendanceCharts sabbathData={sabbathData} monthlyTrend={monthlyTrend} />;
}
