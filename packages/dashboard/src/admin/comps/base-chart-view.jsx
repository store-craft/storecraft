import Chart from 'chart.js/auto'
import { useEffect, useRef } from 'react'

const BaseChartView = ({ config, ...rest }) => {
  const canvas_ref = useRef();
  /** @type {React.MutableRefObject<Chart>} */
  const chart = useRef();

  useEffect(
    () => {
      if(chart.current)
        chart.current.destroy()

      // console.log('color ', Chart.defaults.borderColor)
      chart.current = new Chart(
        canvas_ref.current, config
      )
      // chart.current.update()

      return () => {
        chart.current.destroy()
      }
    }
    , [config]
  )

  
  return (
<div {...rest} >
  <canvas ref={canvas_ref} />
</div>
  )
}

export default BaseChartView