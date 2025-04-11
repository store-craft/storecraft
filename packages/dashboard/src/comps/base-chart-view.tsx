import { 
  createChart, SeriesDataItemTypeMap, DeepPartial, 
  ChartOptions, SeriesType, SeriesDefinition, 
  SeriesPartialOptionsMap, 
  IChartApi,
  MouseEventParams,
  ISeriesApi,
  Point,
  MouseEventHandler,
  Time,
  HorzScaleOptions,
  PriceScaleOptions
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { type withDiv } from './types';

export type ToolTipParams = {
  chart?: {
    data?: SeriesDataItemTypeMap[SeriesType];
    point?: Point;
    event_params?: MouseEventParams;
  }
}

export type SeriesConfig<T extends SeriesType> = {
  definition: SeriesDefinition<T>;
  data: SeriesDataItemTypeMap[T][];
  options?: SeriesPartialOptionsMap[T];
  priceScaleOptions?: DeepPartial<PriceScaleOptions>;
}

export type BaseChartViewParams = withDiv<{
  config: {
    series: SeriesConfig<SeriesType>[],
    chart: {
      options?: DeepPartial<ChartOptions>;
      timeScaleOptions?: DeepPartial<HorzScaleOptions>;
      priceScaleOptions?: DeepPartial<PriceScaleOptions>;
      fitContent?: boolean;
    },
    tooltip?: {
      component?: React.FC<ToolTipParams>;
    }
  }
}>;

type ToolTipContainerParams = {
  left?: string,
  top?: string,
  show?: boolean,
  tooltip_params?: ToolTipParams["chart"];
}

const BaseChartView = (
  { 
    config, ...rest 
  }: BaseChartViewParams
) => {

  const {
    series,
    chart: $chart = {},
    tooltip
  } = config;

  const chartContainerRef = useRef<HTMLDivElement>(undefined);
  const chartApiRef = useRef<IChartApi>(undefined);
  const chartSeriesApiRef = useRef<ISeriesApi<SeriesType>[]>([]);
  const toolTipContainerRef = useRef<HTMLDivElement>(undefined);
  const [toolTipContainerParams, setToolTipContainerParams] = useState<ToolTipContainerParams>({});

  useEffect(
    () => {
      const handleResize = () => {
        chart.applyOptions(
          { 
            width: chartContainerRef.current.clientWidth 
          }
        );
      };

      // setup `chart`
      const chart = createChart(
        chartContainerRef.current, 
        {
          autoSize: true,
          grid: {
            horzLines: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          width: chartContainerRef.current.clientWidth,
            height: 450,
          ...$chart.options
        }
      );

      chart.timeScale().applyOptions(
        $chart.timeScaleOptions ?? {}
      );

      chart.priceScale('right').applyOptions(
        $chart.priceScaleOptions ?? {}
      );

      if($chart.fitContent) {
        chart.timeScale().fitContent();
      } 
      chartApiRef.current = chart;

      // setup `series`
      let pane_index = 0;
      for (const s of series) {
        const { data, options, definition, priceScaleOptions } = s;

        // console.log({data})
        
        const api_series = chart.addSeries(
          definition, 
          options
        );
        api_series.setData(data);
        if (priceScaleOptions) {
          api_series.priceScale().applyOptions(priceScaleOptions);
        }
        chartSeriesApiRef.current.push(
          api_series
        );
        pane_index+=1;
      }

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    },
    [
      series, $chart,
    ]
  );

  useEffect(
    () => {
      const chart = chartApiRef.current;
      const container = chartContainerRef.current;
      const series = chartSeriesApiRef.current?.at(0);

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
        } else {
          const data = param.seriesData.get(series);
          
          if(!('value' in data))
            throw new Error('value not in data');
  
          const coordinate = series.priceToCoordinate(data.value);
          let shiftedCoordinate = param.point.x - 0;

          if (coordinate === null) {
            return;
          }

          shiftedCoordinate = Math.max(
            0,
            Math.min(
              container.clientWidth - 
              toolTipContainerRef.current.clientWidth, 
              shiftedCoordinate
            )
          );

          const toolTipMargin = 5;
          const coordinateY = (
            coordinate - toolTipContainerRef.current.clientHeight - toolTipMargin > 0
          ) ? (coordinate - toolTipContainerRef.current.clientHeight - toolTipMargin)
            : Math.max(
              0,
              Math.min(
                container.clientHeight - 
                toolTipContainerRef.current.clientHeight - 
                toolTipMargin,
                coordinate + toolTipMargin
              )
            );

          setToolTipContainerParams(
            {
              show: true,
              left: shiftedCoordinate + 'px',
              top: coordinateY + 'px',
              tooltip_params: {
                // data: data,
                point: param.point,
                event_params: param,
              }
            }
          );
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

  // console.log({toolTipContainerParams});

  return (
    <div {...rest}>
      <div className='relative'>
        <div 
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