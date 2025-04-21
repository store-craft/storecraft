import { useMemo, useState } from 'react'
import BaseChartView, { BaseChartViewParams, SeriesConfig } from './base-chart-view'
import useDarkMode from '@/hooks/use-dark-mode'
import { OrdersStatisticsDay, OrdersStatisticsType } from '@storecraft/core/api';
import { 
  AreaData, ColorType, CrosshairMode, HistogramData, 
  HistogramSeries, UTCTimestamp 
} from 'lightweight-charts';
import { AreaSeries } from 'lightweight-charts';

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
  const { event_params } = chart || {};
  if(!event_params) 
    return null;
  const { seriesData } = event_params || {};
  const series_points = Array.from(seriesData.values())
  const income = series_points?.at(0) as AreaData;
  const orders = series_points?.at(1) as HistogramData;

  return (
    <div 
      className='flex flex-col gap-2 border 
        shelf-plain-card-fill p-2 rounded-md w-fit h-fit'>
      {
        income && 
        <div className='flex flex-row gap-2 '>
          <div className='text-sm font-extrabold'>Income</div>
          <div className='text-sm dark:text-white text-black' 
            children={income?.value ?? 0}/>
        </div>
      }
      {
        orders && 
        <div className='flex flex-row gap-2 '>
          <div className='text-sm font-extrabold'>Orders</div>
          <div className='text-sm dark:text-white text-black' 
            children={orders?.value ?? 0}/>
        </div>
      }
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
      const first_day_millis = to_millis(data.from_day);
      // fill the gaps in the data
      let arr: Partial<OrdersStatisticsDay>[] = Array.from(
        { 
          length: data.count_days 
        }
      ).map(
        (_, ix) => ({
          day: new Date(
            first_day_millis + (ix * DAY)
          ).toISOString()
        })
      );

      // fill the data into the gaps
      Object.
      entries(data.days).
      forEach(
        ([k, v]) => {
          arr[(to_millis(k)-first_day_millis)/DAY] = v
        }
      );

      console.log({arr})
      // arr[30] = {
      //   ...arr[30],
      //   metrics: {
      //     checkouts_completed: {
      //       total_income: 100,
      //       count: 10
      //     }
      //   }
      // }

      return {
         chart: {
          fitContent: true,
          options: {
            crosshair: {
              mode: CrosshairMode.Normal
            },
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
            data: arr.map(
              (it, ix) => ({
                time: Math.floor(new Date(it?.day).getTime()/1000) as UTCTimestamp,
                value: it?.metrics?.checkouts_completed?.total_income ?? 0,
              })     
            ),
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
            data: arr.map(
              (it, ix) => ({
                time: Math.floor(new Date(it?.day).getTime()/1000) as UTCTimestamp,
                value: it?.metrics?.checkouts_completed?.count ?? 0,
              })     
            ),
          } as SeriesConfig<'Histogram'>,
        ].slice(0)
      } as BaseChartViewParams["config"]

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
