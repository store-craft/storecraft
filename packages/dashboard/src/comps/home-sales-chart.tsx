import { useMemo, useState } from 'react'
import BaseChartView, { BaseChartViewParams } from './base-chart-view.js'
import useDarkMode from '@/hooks/use-dark-mode.js'
import { Chart, ChartConfiguration } from 'chart.js'
import { OrdersStatisticsDay, OrdersStatisticsType } from '@storecraft/core/api';
import { ColorType } from 'lightweight-charts';

const DAY = 86400000;

export type SalesChartParams = {
  data: OrdersStatisticsType;
} & Omit<BaseChartViewParams, "config">;


const to_millis = (d: number | string | Date) => (new Date(d)).getTime()


const SalesChart = (
  { 
    data, ...rest 
  }: SalesChartParams
) => {

  const [showIndex, setShowIndex] = useState(0)
  const { darkMode } = useDarkMode()

  const config = useMemo<BaseChartViewParams["config"]>(
    () => {
      let arr: OrdersStatisticsDay[] = Array.from({ length: data.count_days });
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

      return {
        options: {
          autoSize: true,
          // height: 250,
          layout: {
            attributionLogo: false,
            background: {
              // color: darkMode ? '#1e293b' : '#ffffff',
              color:'transparent',
              type: ColorType.Solid,
            },
            textColor: darkMode ? '#d1d5db' : '#374151',
          }
        },
        data: [
          { time: '2018-12-22', value: 32.51 },
          { time: '2018-12-23', value: 31.11 },
          { time: '2018-12-24', value: 27.02 },
          { time: '2018-12-25', value: 27.32 },
          { time: '2018-12-26', value: 25.17 },
          { time: '2018-12-27', value: 28.89 },
          { time: '2018-12-28', value: 25.46 },
          { time: '2018-12-29', value: 23.92 },
          { time: '2018-12-30', value: 22.68 },
          { time: '2018-12-31', value: 22.67 },
        ]
      }

      // Chart.defaults.color = darkMode ? '#d1d5db' : '#6b7280';
      // Chart.defaults.borderColor = darkMode ? '#334155' : '#d1d5db';

      // console.log('arr', arr)
      // console.log('data', data)
      // console.log('data.info.days', data.days)
      // console.log('xs', xs)
      // console.log('ys1', ys1)
      // console.log('ys2', ys2)

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
    {...rest} 
  />   
  )
}

export default SalesChart
