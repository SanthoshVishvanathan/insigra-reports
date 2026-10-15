import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function LeadChart({ data, companyName }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
        No campaign data available for chart visualization.
      </div>
    )
  }

  // Channel labels & lead values
  const labels = data.map((item) => item.channel)
  const leads = data.map((item) => item.leads)

  // Subtle branded gradient colors for bars
  const backgroundColors = [
    'rgba(2, 132, 199, 0.85)',   // Brand sky blue
    'rgba(14, 165, 233, 0.85)',
    'rgba(56, 189, 248, 0.85)',
    'rgba(99, 102, 241, 0.85)',  // Indigo
    'rgba(139, 92, 246, 0.85)',  // Violet
    'rgba(16, 185, 129, 0.85)',  // Emerald
  ]

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Leads Generated',
        data: leads,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: backgroundColors.slice(0, labels.length).map(c => c.replace('0.85', '1')),
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(2, 132, 199, 1)',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Leads: ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 12, weight: '500' },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          precision: 0,
        },
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Leads by Channel</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time performance metrics isolated for <span className="font-medium text-sky-700">{companyName}</span>
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
          Chart.js Live
        </span>
      </div>
      <div className="h-72 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
