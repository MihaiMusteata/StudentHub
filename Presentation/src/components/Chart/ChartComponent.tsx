import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto'; 
import { BarChartProps, barChartConfig } from './BarChart.tsx';

export interface ChartComponentProps {
  type: string;
  barChartProps: BarChartProps;
}

const ChartComponent: React.FC<ChartComponentProps> = ({type, barChartProps}) => {
  const chartRef = useRef<HTMLCanvasElement>(null); 
  const chartInstance = useRef<Chart>(); 
  
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        
        var chartConfig;
        
        switch (type) {
          case 'bar':
            chartConfig = barChartConfig(barChartProps);
            break;
          default:
            break;
        }
        
        if (chartInstance.current) {
          chartInstance.current.data = chartConfig.data;
          chartInstance.current.update();
        } else {
          chartInstance.current = new Chart(ctx, chartConfig);
        }

      }
    }
  }, [chartRef]);

  return (
    <>
      <canvas ref={chartRef} id="ChartComponent" className="chart-canvas" height="270"></canvas>
    </>
  );
};
export default ChartComponent;