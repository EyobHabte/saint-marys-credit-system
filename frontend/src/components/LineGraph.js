// src/components/LineGraph.js
import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary Chart.js components for a Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LineGraph = ({ data }) => {
  const chartRef = useRef(null);

  // Default sample data (will be used if no external data is passed)
  const sampleData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Active Loans',
        data: [30, 50, 40, 60, 70, 45, 80],
        // This color will be replaced with a gradient in the useEffect
        backgroundColor: 'rgba(58, 123, 213, 0.2)',
        borderColor: '#3A7BD5',
        borderWidth: 1,
      },
    ],
  };

  // Use the provided data or fallback to sampleData
  const graphData = data || sampleData;

  // Apply a gradient fill to the bars if using the default sample data
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
      gradient.addColorStop(0, 'rgba(58, 123, 213, 0.3)');
      gradient.addColorStop(1, 'rgba(58, 123, 213, 0)');
      graphData.datasets[0].backgroundColor = gradient;
      chart.update();
    }
  }, [graphData]);

  // Chart options similar to your original visibility settings
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#777' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(200, 200, 200, 0.3)' },
        ticks: { color: '#777' },
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar ref={chartRef} data={graphData} options={options} />
    </div>
  );
};

export default LineGraph;
