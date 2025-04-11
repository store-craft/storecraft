import { 
  createChart, SeriesDataItemTypeMap, DeepPartial, 
  ChartOptions, SeriesType, SeriesDefinition, 
  SeriesPartialOptionsMap, 
  IChartApi,
  MouseEventParams,
  ISeriesApi,
  Point,
  MouseEventHandler,
  Time
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { type withDiv } from './types';

export type ToolTipParams<T extends SeriesType> = {
  chart?: {
    data?: SeriesDataItemTypeMap[T];
    point?: Point;
    event_params?: MouseEventParams;
  }
}

const ToolTip = <T extends SeriesType>(
  {
    chart
  } : ToolTipParams<T> & React.ComponentProps<'div'>
) => {

  return (
    <div className='absolute bg-white text-black p-2 rounded-md w-fit h-fit'>
      <div className='text-sm'>Tooltip</div>
    </div>
  )
}


export type BaseChartViewParams<T extends SeriesType> = withDiv<{
  config: {
    series: {
      data: SeriesDataItemTypeMap[T][];
      options: SeriesPartialOptionsMap[T];
      definition: SeriesDefinition<T>;
    },
    chart_options?: DeepPartial<ChartOptions>,
    tooltip?: {
      component?: React.FC<ToolTipParams<T>>;
    }
  }
}>;

type ToolTipContainerParams<T extends SeriesType> = {
  left?: string,
  top?: string,
  show?: boolean,
  tooltip_params?: ToolTipParams<T>["chart"];
}

const BaseChartView = <T extends SeriesType>(
  { 
    config, ...rest 
  }: BaseChartViewParams<T>
) => {

  const {
    series: {
      data = [] as SeriesDataItemTypeMap[T][],
      definition = {} as SeriesDefinition<T>,
      options = {} as SeriesPartialOptionsMap[T],
    },
    chart_options = {},
    tooltip
  } = config;

  const chartContainerRef = useRef<HTMLDivElement>(undefined);
  const chartApiRef = useRef<IChartApi>(undefined);
  const chartSeriesApiRef = useRef<ISeriesApi<T>>(undefined);
  const toolTipContainerRef = useRef<HTMLDivElement>(undefined);
  const [toolTipContainerParams, setToolTipContainerParams] = useState<ToolTipContainerParams<T>>({});

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
            },
          },
          width: chartContainerRef.current.clientWidth,
            height: 450,
          ...chart_options
        }
      );
      chartApiRef.current = chart;

      chart.timeScale().fitContent();

      const newSeries = chart.addSeries(
        definition, 
        options
      );

      chartSeriesApiRef.current = newSeries;

      newSeries.setData(data);

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    },
    [
      data, options, definition, chart_options,
    ]
  );

  useEffect(
    () => {
      const chart = chartApiRef.current;
      const container = chartContainerRef.current;
      const series = chartSeriesApiRef.current;

      const handler: MouseEventHandler<Time> = (param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > container.clientWidth ||
          param.point.y < 0 ||
          param.point.y > container.clientHeight
        ) {
          setToolTipContainerParams({show: false});
          // toolTip.style.display = 'none';
        } else {
          // time will be in the same format that we supplied to setData.
          // thus it will be YYYY-MM-DD
          const data = param.seriesData.get(series);
          
          if(!('value' in data))
            throw new Error('value not in data');
          
          // const dateStr = param.time;
          // const price = data.value !== undefined ? data.value : data.close;
          // toolTip.style.display = 'block';
          // toolTip.innerHTML = `<div style="color: ${'#2962FF'}">Apple Inc.</div><div style="font-size: 24px; margin: 4px 0px; color: ${'black'}">
          //     ${Math.round(100 * price) / 100}
          //     </div><div style="color: ${'black'}">
          //     ${dateStr}
          //     </div>`;
  
          const coordinate = series.priceToCoordinate(data.value);
          let shiftedCoordinate = param.point.x - 0;

          if (coordinate === null) {
            return;
          }

          shiftedCoordinate = Math.max(
            0,
            Math.min(container.clientWidth - toolTipContainerRef.current.clientWidth, shiftedCoordinate)
          );

          const toolTipMargin = 5;
          const coordinateY =
            coordinate - toolTipContainerRef.current.clientHeight - toolTipMargin > 0
              ? coordinate - toolTipContainerRef.current.clientHeight - toolTipMargin
              : Math.max(
                0,
                Math.min(
                  container.clientHeight - toolTipContainerRef.current.clientHeight - toolTipMargin,
                  coordinate + toolTipMargin
                )
              );

          setToolTipContainerParams(
            {
              show: true,
              left: shiftedCoordinate + 'px',
              top: coordinateY + 'px',
              tooltip_params: {
                data: data,
                point: param.point,
                event_params: param,
              }
            }
          );
          // toolTip.style.left = shiftedCoordinate + 'px';
          // toolTip.style.top = coordinateY + 'px';
        }
      }
      chart.subscribeCrosshairMove(
        handler
      );

      return () => {
        chart.unsubscribeCrosshairMove(handler);
      };
    }, [chartApiRef.current]
  );

  console.log({toolTipContainerParams});

  return (
    <div {...rest}>
      <div className='relative'>
        <div cclassName='bg-pink-400'
          {...rest}
          ref={chartContainerRef}
          style={{
            zIndex: 1,
          }}
        />
        {
          tooltip?.component && (
            <div 
              className='absolute block w-fit h-fit'
              ref={toolTipContainerRef} 
              style={{
                left: toolTipContainerParams.left,
                top: toolTipContainerParams.top,
                display: toolTipContainerParams.show ? 'block' : 'none',
                zIndex: 10,
                'pointerEvents': 'none'
              }}
            >
              <tooltip.component 
                chart={toolTipContainerParams.tooltip_params}
              />
            </div>
          )
        }
      </div>
    </div>
  );
}

export default BaseChartView