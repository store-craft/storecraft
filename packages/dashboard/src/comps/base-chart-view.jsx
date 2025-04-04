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
  Tooltip, Legend
} from "chart.js";

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


/**
 * 
 * @typedef {object} InnerBaseChartViewParams
 * @prop {import('chart.js').ChartConfiguration<>} config
 * 
 * 
 * @typedef {InnerBaseChartViewParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } BaseChartViewParams
 * 
 * 
 * @param {BaseChartViewParams} params
 * 
 */
const BaseChartView = (
  { 
    config, ...rest 
  }
) => {

  const canvas_ref = useRef();
  /** @type {React.MutableRefObject<Chart>} */
  const chart = useRef();

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