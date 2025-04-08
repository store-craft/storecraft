import { useEffect, useRef } from 'react'
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  BarElement,
  Tooltip, Legend,
  ChartConfiguration
} from "chart.js";
import { withDiv } from './types';

Chart.register(
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement, 
  BarController,
  BarElement, 
  Tooltip, Legend
);

export type BaseChartViewParams = withDiv<{
  config: ChartConfiguration;
}>;

const BaseChartView = (
  { 
    config, ...rest 
  }: BaseChartViewParams
) => {

  const canvas_ref = useRef<HTMLCanvasElement>(undefined);
  const chart = useRef<Chart>(undefined);

  useEffect(
    () => {
      if(chart.current)
        chart.current.destroy();

      // console.log('color ', Chart.defaults.borderColor)
      
      chart.current = new Chart(
        canvas_ref.current, config
      );

      // chart.current.update()

      return () => {
        chart.current.destroy()
      }
    }
    , [config]
  );

  
  return (
<div {...rest} >
  <canvas ref={canvas_ref} />
</div>
  )
}

export default BaseChartView