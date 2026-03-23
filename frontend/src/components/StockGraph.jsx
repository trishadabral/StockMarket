import { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function StockGraph({ stockData, threshold }) {
    const chartRef = useRef(null);

    if (!stockData) {
        return (
            <div className="card h-full flex items-center justify-center">
                <div className="text-center text-slate-400">
                    <div className="text-5xl mb-4">📈</div>
                    <p className="text-lg">No stock data available</p>
                    <p className="text-sm mt-2">Start monitoring a stock to see the chart</p>
                </div>
            </div>
        );
    }

    const { symbol, currentPrice, changePercent, windowAnalysis } = stockData;
    const priceHistory = stockData.priceHistory || [];

    // Prepare chart data
    const labels = priceHistory.map((_, index) => `T-${priceHistory.length - index}`);
    const prices = priceHistory;

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Price (₹)',
                data: prices,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            }
        ]
    };

    // Add threshold lines if available
    if (threshold) {
        const targetLine = Array(prices.length).fill(threshold.buyPrice + threshold.targetProfit);
        const stopLossLine = Array(prices.length).fill(threshold.buyPrice - threshold.stopLoss);
        const buyLine = Array(prices.length).fill(threshold.buyPrice);

        chartData.datasets.push({
            label: 'Target Profit',
            data: targetLine,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
        });

        chartData.datasets.push({
            label: 'Buy Price',
            data: buyLine,
            borderColor: 'rgb(251, 191, 36)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
        });

        chartData.datasets.push({
            label: 'Stop Loss',
            data: stopLossLine,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
        });
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#cbd5e1',
                    font: {
                        size: 12,
                        family: 'Inter'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#cbd5e1',
                bodyColor: '#cbd5e1',
                borderColor: '#475569',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '₹' + context.parsed.y.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(71, 85, 105, 0.3)',
                },
                ticks: {
                    color: '#cbd5e1',
                    callback: function (value) {
                        return '₹' + value.toFixed(0);
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(71, 85, 105, 0.3)',
                },
                ticks: {
                    color: '#cbd5e1',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    };

    const getTrendClass = () => {
        if (!windowAnalysis?.trend) return 'trend-stable';
        switch (windowAnalysis.trend) {
            case 'RISING': return 'trend-rising';
            case 'FALLING': return 'trend-falling';
            default: return 'trend-stable';
        }
    };

    const getPriceChangeClass = () => {
        if (!changePercent) return '';
        return changePercent >= 0 ? 'price-up' : 'price-down';
    };

    return (
        <div className="card-gradient h-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{symbol}</h2>
                    {windowAnalysis?.trend && (
                        <span className={`trend-badge ${getTrendClass()}`}>
                            {windowAnalysis.trend === 'RISING' && '📈 '}
                            {windowAnalysis.trend === 'FALLING' && '📉 '}
                            {windowAnalysis.trend === 'STABLE' && '➡️ '}
                            {windowAnalysis.trend}
                        </span>
                    )}
                </div>

                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">₹{currentPrice?.toFixed(2)}</span>
                    {changePercent !== null && changePercent !== undefined && (
                        <span className={`text-lg font-semibold ${getPriceChangeClass()}`}>
                            {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                        </span>
                    )}
                </div>

                {/* Window Analysis Stats */}
                {windowAnalysis && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Min</div>
                            <div className="text-sm font-semibold">₹{windowAnalysis.min?.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Max</div>
                            <div className="text-sm font-semibold">₹{windowAnalysis.max?.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Avg</div>
                            <div className="text-sm font-semibold">₹{windowAnalysis.average?.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Volatility</div>
                            <div className="text-sm font-semibold">₹{windowAnalysis.volatility?.toFixed(2)}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="chart-container">
                <Line ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
}
