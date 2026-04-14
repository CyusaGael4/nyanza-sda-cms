"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const LazyFinanceChart = dynamic(
  () => import("@/components/charts/FinanceChart").then((mod) => mod.FinanceChart),
  {
    ssr: false,
    loading: () => (
      <section className="card">
        <LoadingSpinner center label="Birimo gufungura imibare y'amaturo..." />
      </section>
    )
  }
);

export function FinanceChartLoader({
  breakdown,
  monthlyTrend
}: {
  breakdown: { name: string; amount: number }[];
  monthlyTrend: { label: string; amount: number }[];
}) {
  return <LazyFinanceChart breakdown={breakdown} monthlyTrend={monthlyTrend} />;
}
