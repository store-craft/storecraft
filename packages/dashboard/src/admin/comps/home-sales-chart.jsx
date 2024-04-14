import { useMemo, useState } from 'react'
import BaseChartView from './base-chart-view.jsx'
import useDarkMode from '@/admin/hooks/useDarkMode.js'
import { Chart } from 'chart.js'

const DAY = 86400000

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

/**
 * @param {number | string | Date} d 
 */
const to_millis = d => (new Date(d)).getTime()


/**
 * 
 * @typedef {object} InnerSalesChartParams
 * @prop {import('@storecraft/core/v-api').OrdersStatisticsType} data
 * 
 * 
 * @typedef {InnerSalesChartParams & 
 *  Omit<import('./base-chart-view.jsx').BaseChartViewParams, 'config'>
 * } SalesChartParams
 * 
 * 
 * @param {SalesChartParams} params
 * 
 */
const SalesChart = (
  { 
    data, ...rest 
  }
) => {

  const [showIndex, setShowIndex] = useState(0)
  const { darkMode } = useDarkMode()

  /** @type {import('chart.js').ChartConfiguration} */
  const config = useMemo(
    () => {
      /** @type {import('@storecraft/core/v-api').OrdersStatisticsDay[]} */
      let arr = Array.from({ length: data.count_days });
      Object.
        entries(data.days).
        forEach(
          ([k, v]) => {
            arr[(to_millis(k)-to_millis(data.from_day))/DAY] = v
          }
        );

      const xs = arr.map((it, ix) => it?.day ? 
                new Date(it?.day).toLocaleDateString() : '')
      const ys1 = arr.map(
        (it, ix) => it?.metrics?.checkouts_created?.total_income ?? 0
      );
      const ys2 = arr.map(
        (it, ix) => it?.metrics?.checkouts_created?.count ?? 0
      );

      Chart.defaults.color = darkMode ? '#d1d5db' : '#6b7280';
      Chart.defaults.borderColor = darkMode ? '#334155' : '#d1d5db';

      console.log('arr', arr)
      console.log('data', data)
      console.log('data.info.days', data.days)
      console.log('xs', xs)
      console.log('ys1', ys1)
      console.log('ys2', ys2)

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
                // ccolor: darkMode ? '#334155' : '#d1d5db'
              },
              beginAtZero:true,
              ticks: {
                // autoSkip: true
              }
            },
            y: {
              grid: {
                // ccolor: darkMode ? '#334155' : '#d1d5db'
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
    }, [data, showIndex, darkMode]
  )

  return (
<BaseChartView 
    key={String(darkMode)} 
    config={config} 
    {...rest} />   
  )
}

export default SalesChart
