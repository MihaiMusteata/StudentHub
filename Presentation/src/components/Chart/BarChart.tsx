import { ChartConfiguration } from 'chart.js-auto';

export interface BarChartProps {
  labels: string[];
  data: number[];
  label: string;
}

export const barChartConfig:ChartConfiguration = (props: BarChartProps) => {
  return {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.label,
          tension: 0.4,
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
          backgroundColor: 'rgba(255, 255, 255, .8)',
          data: props.data,
          maxBarThickness: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            color: 'rgba(255, 255, 255, .2)',
          },
          ticks: {
            padding: 10,
            font: {
              size: 14,
              weight: 300,
              family: 'Roboto',
              style: 'normal',
              lineHeight: 2,
            },
            color: '#fff',
          },
        },
        x: {
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            color: 'rgba(255, 255, 255, .2)',
          },
          ticks: {
            display: true,
            color: '#f8f9fa',
            padding: 10,
            font: {
              size: 14,
              weight: 300,
              family: 'Roboto',
              style: 'normal',
              lineHeight: 2,
            },
          },
        },
      },
    },
  };
};
