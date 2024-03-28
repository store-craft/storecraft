import { useMemo, useState } from 'react'
import BaseChartView from './base-chart-view'
const DAY = 86400000
import useDarkMode from '../hooks/useDarkMode'
import { Chart } from 'chart.js'

// useEffect(
//   () => {
//     // Chart.defaults.color = '#6b7280';
//     // Chart.defaults.borderColor = darkMode ? '#334155' : '#FFF';
//     // chart.current.config.options.scales.x.grid.borderColor = darkMode ? '#334155' : '#FFF';
//     chart.current.config.options.scales.x.grid.borderColor = darkMode ? '#FFF' : '#000';
//     console.log(chart.current.config.options.scales.x.grid.borderColor)
//     chart.current.update()

//   }, [darkMode]
// )
const SalesChart = ({ data, span, ...rest }) => {
  const [showIndex, setShowIndex] = useState(0)
  const { darkMode } = useDarkMode()
  const config = useMemo(
    () => {
      let arr = Array.from({length : 91})
      Object.entries(data.info.days)
            .forEach(([k, v]) => arr[(k-data.fromDay)/DAY] = v)

      arr = arr.slice(arr.length - span)
      const xs = arr.map((it, ix) => it?.day ? 
                new Date(it?.day).toLocaleDateString() : '')
      const ys1 = arr.map((it, ix) => it?.total ?? 0) // Math.random()*2000)
      const ys2 = arr.map((it, ix) => it?.orders ?? 0) // Math.random()*40)

      Chart.defaults.color = darkMode ? '#d1d5db' : '#6b7280';
      Chart.defaults.borderColor = darkMode ? '#334155' : '#d1d5db';

      return {
        type: 'bar',
        options: { 
          plugins: {
            legend: { 
              labels: {
                // usePointStyle: true,
                boxWidth: 4,
                pointStyleWidth: 2
              },
                display: true,
                onClick: (ev, item, legend) => 
                    setShowIndex(ind => (++ind)%2)
            }
          },
          scales: {
            x: {
              grid: {
                ccolor: darkMode ? '#334155' : '#d1d5db'
              },
              beginAtZero:true,
              ticks: {
                // autoSkip: true
              }
            },
            y: {
              grid: {
                ccolor: darkMode ? '#334155' : '#d1d5db'
              },
              beginAtZero:true,
              ticks: {
                precision: 0
              }
            }
          },
          // spanGaps: true,
          responsive: true,
          maintainAspectRatio: false,
          // aspectRatio:1
        },
        data: {
          labels: xs,
          datasets: [
            {
              label: 'Income per day',
              // backgroundColor: '#f5f1ff',
              // borderColor: 'rgb(236 72 153)',
              backgroundColor: 'rgb(236 72 153)',
              borderColor: '#000000',
              // borderWidth: 1,
              pointRadius:0,
              tension: 0.1,
              skipNull:true,
              data: ys1,
              fill:true,
              hidden: Boolean(showIndex!=0),
              // barThickness: 10,
              stack: '1',
            },
            {
              label: 'Orders per day',
              hidden: Boolean(showIndex!=1),
              // backgroundColor: '#ad74ff',
              // borderColor: 'rgb(236 72 153)',
              backgroundColor: '#973cff',
              borderColor: '#000000',
              
              pointRadius:0,
              tension: 0.1,
              data: ys2,
              // barThickness: 4,
              stack: '12',
            }
          ]
        }
      }
    }, [data, showIndex, span, darkMode]
  )

  return (
<BaseChartView key={darkMode} config={config} {...rest} />   
  )
}

export default SalesChart
