import { AreaSeries, createChart, ColorType, SeriesDataItemTypeMap, AreaData, Time, WhitespaceData, DeepPartial, ChartOptions } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import { type withDiv } from './types';


export type BaseChartViewParams = withDiv<{
  config: {
    data: SeriesDataItemTypeMap<Time>[keyof SeriesDataItemTypeMap<Time>][],
    options?: DeepPartial<ChartOptions>,
    colors?: {
      backgroundColor?: string;
      lineColor?: string;
      textColor?: string;
      areaTopColor?: string;
      areaBottomColor?: string;
    };
  }
}>;

const BaseChartView = (
  { 
    config, ...rest 
  }: BaseChartViewParams
) => {

  const {
    data,
    options = {},
    colors: {
      backgroundColor = 'white',
      lineColor = 'black',
      textColor = 'black',
      areaTopColor = '#2962FF',
      areaBottomColor = 'rgba(41, 98, 255, 0.28)',
    } = {},
  } = config;

  const chartContainerRef = useRef<HTMLDivElement>(undefined);

  useEffect(
    () => {
      const handleResize = () => {
        chart.applyOptions(
          { 
            width: chartContainerRef.current.clientWidth 
          }
        );
      };

      const chart = createChart(
        chartContainerRef.current, 
        {
          grid: {
            horzLines: {
              color: 'rgba(0, 0, 0, 0.1)',
            }
          },
          layout: {
            background: { type: ColorType.Solid, color: backgroundColor },
            textColor,
          },
          width: chartContainerRef.current.clientWidth,
          height: 450,
          ...options
        }
      );

      chart.timeScale().fitContent();

      const newSeries = chart.addSeries(
        AreaSeries, 
        { 
          priceLineColor: 'green',
          lineColor: 'red', topColor: 'green', 
          bottomColor: areaBottomColor ,
          crosshairMarkerBorderColor: 'red',
          baseLineColor: 'red',
          crosshairMarkerBackgroundColor: 'red',
        }
      );

      newSeries.setData(data as (AreaData<Time> | WhitespaceData<Time>)[]);

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    },
    [
      data, backgroundColor, lineColor, 
      textColor, areaTopColor, areaBottomColor
    ]
  );

  return (
    <div {...rest}
      ref={chartContainerRef}
    />
  );
}

export default BaseChartView