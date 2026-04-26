import { useEffect, useMemo, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function buildSeedData(basePrice) {
  const seed = [];
  let value = Number(basePrice) || 120;
  for (let i = 0; i < 10; i++) {
    value += (Math.random() - 0.5) * 4;
    seed.push({
      time: `${i + 1}`,
      price: Number(value.toFixed(2)),
    });
  }
  return seed;
}

export default function LiveChart({ currentPrice = 120, series = [] }) {
  const [internalSeries, setInternalSeries] = useState(() => buildSeedData(currentPrice));

  useEffect(() => {
    setInternalSeries((prev) => {
      if (prev.length === 0) {
        return buildSeedData(currentPrice);
      }
      const next = prev.slice();
      next[next.length - 1] = {
        ...next[next.length - 1],
        price: Number(currentPrice.toFixed(2)),
      };
      return next;
    });
  }, [currentPrice]);

  useEffect(() => {
    if (Array.isArray(series) && series.length > 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setInternalSeries((prev) => {
        const last = prev[prev.length - 1]?.price ?? Number(currentPrice) ?? 120;
        const nextPrice = Number((last + (Math.random() - 0.5) * 3).toFixed(2));
        const nextPoint = {
          time: `${Date.now()}`,
          price: nextPrice,
        };
        const updated = [...prev, nextPoint].slice(-10);
        return updated;
      });
    }, 2000);

    return () => window.clearInterval(timer);
  }, [currentPrice, series]);

  const displaySeries = useMemo(() => {
    if (Array.isArray(series) && series.length > 0) {
      return series.map((price, index) => ({
        time: `${index + 1}`,
        price: Number(price),
      }));
    }
    return internalSeries;
  }, [internalSeries, series]);

  const chartData = useMemo(() => {
    const labels = displaySeries.map((_, index) => `${index + 1}`);
    const points = displaySeries.map((item) => item.price);
    return {
      labels,
      datasets: [
        {
          data: points,
          borderColor: "#8de5ff",
          backgroundColor: "rgba(141, 229, 255, 0.12)",
          borderWidth: 2.5,
          pointRadius: 0,
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [displaySeries]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(9, 14, 22, 0.95)",
          borderColor: "rgba(148, 163, 184, 0.25)",
          borderWidth: 1,
          titleColor: "#93c5fd",
          bodyColor: "#e2e8f0",
          callbacks: {
            label: (context) => `Price: Rs ${Number(context.parsed.y || 0).toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(148, 163, 184, 0.08)",
          },
          ticks: {
            color: "#94a3b8",
            maxTicksLimit: 6,
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: "rgba(148, 163, 184, 0.18)",
            borderDash: [3, 3],
          },
          ticks: {
            color: "#94a3b8",
            font: {
              size: 11,
            },
          },
        },
      },
    }),
    []
  );

  return (
    <article className="stock-card" style={{ minHeight: 240 }}>
      <h3>Live Price Trend</h3>
      <div className="chart-container" style={{ height: 180 }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </article>
  );
}
