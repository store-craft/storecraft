import { useMemo, useState } from 'react'
import BaseChartView, { BaseChartViewParams, SeriesConfig } from './base-chart-view'
import useDarkMode from '@/hooks/use-dark-mode'
import { OrdersStatisticsDay, OrdersStatisticsType } from '@storecraft/core/api';
import { AreaData, BarStyleOptions, ColorType, HistogramData, HistogramSeries } from 'lightweight-charts';
import { AreaSeries, createChart } from 'lightweight-charts';

const DAY = 86400000;

export type SalesChartParams = {
  data: OrdersStatisticsType;
} & React.ComponentProps<'div'>;


const to_millis = (d: number | string | Date) => (new Date(d)).getTime()

export const ChartToolTip: BaseChartViewParams["config"]["tooltip"]["component"] = (
  {
    chart
  }
) => {  
  console.log({chart});

  const { event_params } = chart || {};
  if(!event_params) 
    return null;
  const { seriesData } = event_params || {};
  const series_points = Array.from(seriesData.values())
  const income = series_points?.at(0) as AreaData;
  const orders = series_points?.at(1) as HistogramData;

  return (
    <div className='--absolute flex flex-col gap-2 border shelf-plain-card-fill p-2 rounded-md w-fit h-fit'>
      <div className='flex flex-row gap-2 '>
        <div className='text-sm font-extrabold'>Income</div>
        <div className='text-sm dark:text-white text-black' 
          children={income.value}/>
      </div>
      <div className='flex flex-row gap-2 '>
        <div className='text-sm font-extrabold'>Orders</div>
        <div className='text-sm dark:text-white text-black' 
          children={orders.value}/>
      </div>
    </div>
  )
}

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
         chart: {
          fitContent: true,
          options: {
            autoSize: true,
            // height: 250,
            grid: {
              horzLines: {
                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              vertLines: {
                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
  
            },
            layout: {
  
              attributionLogo: false,
              background: {
                // color: darkMode ? '#1e293b' : '#ffffff',
                color: 'transparent',
                type: ColorType.Solid,
  
              },
              textColor: darkMode ? '#d1d5db' : '#374151',
              
            }
          }          
        },
        tooltip: {
          component: ChartToolTip,
        },
        series: [
          {
            definition: AreaSeries,
            data: [
              { time: '2018-12-22', value: 32.5 },
              { time: '2018-12-23', value: 311 },
              { time: '2018-12-24', value: 272 },
              { time: '2018-12-25', value: 272 },
              { time: '2018-12-26', value: 257 },
              { time: '2018-12-27', value: 289 },
              { time: '2018-12-28', value: 256 },
              { time: '2018-12-29', value: 232 },
              { time: '2018-12-30', value: 228 },
              { time: '2018-12-31', value: 227 },
              { time: '2019-01-22', value: 32 },
              { time: '2019-01-23', value: 31 },
              { time: '2019-01-24', value: 22 },
              { time: '2019-01-25', value: 22 },
              { time: '2019-01-26', value: 27 },
              { time: '2019-01-27', value: 29 },
              { time: '2019-01-28', value: 26 },
              { time: '2019-01-29', value: 22 },
              { time: '2019-01-30', value: 28 },
              { time: '2019-01-31', value: 227 },    
            ],        
            priceScaleOptions: {
              scaleMargins: {
                top: 0.15, // highest point of the series will be 10% away from the top
                bottom: 0.40, // lowest point will be 40% away from the bottom
              },
            },
            options: {
              topColor: darkMode ? 'rgba(246, 51, 154, 0.8)' : 'rgba(151, 60, 255, 0.8)',
              bottomColor: darkMode ? 'rgba(246, 51, 154, 0.13)' : 'rgba(151, 60, 255, 0.128)',
              lineColor: darkMode ? 'rgba(246, 51, 154, 1.0)' : 'rgba(151, 60, 255, 1.0)',
              lineWidth: 4,
              crossHairMarkerVisible: true,
              crossHairMarkerRadius: 4,
              crossHairMarkerBorderWidth: 2,
              crossHairMarkerBorderColor: darkMode ? '#ffffff' : '#000000',
              crossHairMarkerBackgroundColor: darkMode ? '#1e293b' : '#ffffff',
              crossHairMarkerTextColor: darkMode ? '#ffffff' : '#000000',
              crossHairMarkerFontSize: 12,
              crossHairMarkerFontFamily: 'Arial, Helvetica, sans-serif',
              crossHairMarkerFontWeight: 'bold',
              crossHairMarkerFontStyle: 'normal',
              crossHairMarkerTextAlign: 'center',
              crossHairMarkerTextBaseline: 'middle',
              crossHairMarkerPadding: 4,
              crossHairMarkerBorderRadius: 4,
              title: 'Income',
            },
          } as SeriesConfig<'Area'>,
          {
            definition: HistogramSeries,
            priceScaleOptions: {
              scaleMargins: {
                top: 0.7, // highest point of the series will be 70% away from the top
                bottom: 0,
              },
            },
            options: {
              color: darkMode ? 'rgba(246, 51, 154, 0.5)' : 'rgba(151, 60, 255, 0.5)',
              priceFormat: {
                type: 'volume',
              },
              priceScaleId: '',
              title: 'Orders',
            },
            data: [
              { time: '2018-12-22', value: 32, },
              { time: '2018-12-23', value: 31 },
              { time: '2018-12-24', value: 22 },
              { time: '2018-12-25', value: 22 },
              { time: '2018-12-26', value: 27 },
              { time: '2018-12-27', value: 29 },
              { time: '2018-12-28', value: 26 },
              { time: '2018-12-29', value: 22 },
              { time: '2018-12-30', value: 28 },
              { time: '2018-12-31', value: 227 },
              { time: '2019-01-22', value: 32 },
              { time: '2019-01-23', value: 31 },
              { time: '2019-01-24', value: 22 },
              { time: '2019-01-25', value: 22 },
              { time: '2019-01-26', value: 27 },
              { time: '2019-01-27', value: 29 },
              { time: '2019-01-28', value: 26 },
              { time: '2019-01-29', value: 22 },
              { time: '2019-01-30', value: 28 },
              { time: '2019-01-31', value: 227 },            
            ],
          } as SeriesConfig<'Histogram'>,
        ]
      } as BaseChartViewParams["config"]

      // Chart.defaults.color = darkMode ? '#d1d5db' : '#6b7280';
      // Chart.defaults.borderColor = darkMode ? '#334155' : '#d1d5db';

      // console.log('arr', arr)
      // console.log('data', data)
      // console.log('data.info.days', data.days)
      // console.log('xs', xs)
      // console.log('ys1', ys1)
      // console.log('ys2', ys2)

      // return {
      //   type: 'bar',
      //   options: { 
      //     plugins: {
      //       legend: { 
      //         labels: {
      //           // usePointStyle: true,
      //           boxWidth: 4,
      //           pointStyleWidth: 2
      //         },
      //           display: true,
      //           onClick: (ev, item, legend) => 
      //               setShowIndex(ind => (++ind)%2)
      //       }
      //     },
      //     scales: {
      //       x: {
      //         grid: {
      //           // ccolor: darkMode ? '#334155' : '#d1d5db'
      //         },
      //         beginAtZero:true,
      //         ticks: {
      //           // autoSkip: true
      //         }
      //       },
      //       y: {
      //         grid: {
      //           // ccolor: darkMode ? '#334155' : '#d1d5db'
      //         },
      //         beginAtZero:true,
      //         ticks: {
      //           precision: 0
      //         }
      //       }
      //     },
      //     // spanGaps: true,
      //     responsive: true,
      //     maintainAspectRatio: false,
      //     // aspectRatio:1
      //   },
      //   data: {
      //     labels: xs,
      //     datasets: [
      //       {
      //         label: 'Income per day',
      //         // backgroundColor: '#f5f1ff',
      //         // borderColor: 'rgb(236 72 153)',
      //         backgroundColor: 'rgb(236 72 153)',
      //         borderColor: '#000000',
      //         // borderWidth: 1,
      //         pointRadius:0,
      //         tension: 0.1,
      //         skipNull:true,
      //         data: ys1,
      //         fill:true,
      //         hidden: Boolean(showIndex!=0),
      //         // barThickness: 10,
      //         stack: '1',
      //       },
      //       {
      //         label: 'Orders per day',
      //         hidden: Boolean(showIndex!=1),
      //         // backgroundColor: '#ad74ff',
      //         // borderColor: 'rgb(236 72 153)',
      //         backgroundColor: '#973cff',
      //         borderColor: '#000000',
              
      //         pointRadius:0,
      //         tension: 0.1,
      //         data: ys2,
      //         // barThickness: 4,
      //         stack: '12',
      //       }
      //     ]
      //   }
      // }
    }, [data, showIndex, darkMode]
  )

  return (
  <BaseChartView
    className=' bg-pink-700'
    key={String(darkMode)} 
    config={config} 
    {...rest} 
  />   
  )
}

export default SalesChart
