"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function FinanceChart({
  breakdown,
  monthlyTrend
}: {
  breakdown: { name: string; amount: number }[];
  monthlyTrend: { label: string; amount: number }[];
}) {
  if (!breakdown.length && !monthlyTrend.length) {
    return (
      <div className="card">
        <h3>Imibare y&apos;amaturo</h3>
        <p className="muted">Nta makuru y&apos;amaturo arahagera.</p>
      </div>
    );
  }

  return (
    <div className="grid two">
      <div className="card">
        <h3>Ubwoko bw&apos;amaturo</h3>
        <div className="finance-chart-wrap">
          <Doughnut
            data={{
              labels: breakdown.map((item) => item.name),
              datasets: [
                {
                  data: breakdown.map((item) => item.amount),
                  backgroundColor: ["#0f6470", "#1e8a63", "#f0be54", "#f39c38", "#7d5fff"]
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>

      <div className="card">
        <h3>Uko amafaranga agenda</h3>
        <Bar
          data={{
            labels: monthlyTrend.map((item) => item.label),
            datasets: [
              {
                label: "Amafaranga",
                data: monthlyTrend.map((item) => item.amount),
                backgroundColor: "#1e8a63"
              }
            ]
          }}
        />
      </div>
    </div>
  );
}
