"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type AttendanceChartsProps = {
  sabbathData: { label: string; present: number; absent: number }[];
  monthlyTrend: { month: string; attendance: number }[];
};

export function AttendanceCharts({ sabbathData, monthlyTrend }: AttendanceChartsProps) {
  const hasData = sabbathData.length || monthlyTrend.length;

  if (!hasData) {
    return (
      <div className="card">
        <h3>Uko bitabira</h3>
        <p className="muted">
          Nta makuru arahagera. Banza wandike ubwitabire kugira ngo charts zigaragare.
        </p>
      </div>
    );
  }

  return (
    <div className="grid two">
      <div className="card">
        <h3>Abaje kuri buri Sabato</h3>
        <Bar
          data={{
            labels: sabbathData.map((item) => item.label),
            datasets: [
              {
                label: "Yaje",
                data: sabbathData.map((item) => item.present),
                backgroundColor: "#1e8a63"
              },
              {
                label: "Ntago yaje",
                data: sabbathData.map((item) => item.absent),
                backgroundColor: "#d89a31"
              }
            ]
          }}
        />
      </div>

      <div className="card">
        <h3>Uko ukwezi kugenda</h3>
        <Line
          data={{
            labels: monthlyTrend.map((item) => item.month),
            datasets: [
              {
                label: "Abaje",
                data: monthlyTrend.map((item) => item.attendance),
                borderColor: "#0f6470",
                backgroundColor: "rgba(15, 100, 112, 0.14)",
                tension: 0.35,
                fill: true
              }
            ]
          }}
        />
      </div>
    </div>
  );
}
