// tslint:disable: ban-types
// tslint:disable: variable-name

import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/api.service';
import * as FusionCharts from 'fusioncharts';
import { take } from 'rxjs/operators';
import { ENV } from './core/env.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  dataSource: any;
  type: string;
  width: string;
  height: string;
  selectedPeriod = 3; // Default to 3 days
  periodOptions = [3, 4, 5];

  constructor(private apiService: ApiService) {
    this.type = 'timeseries';
    this.width = '100%';
    this.height = (window.innerHeight * 0.8).toString();

    // This is the dataSource of the chart
    this.dataSource = {
      chart: {},
      caption: {
        text: '[STOCK] Stock Price'
      },
      subcaption: {
        text: '[N] days period (30 mins interval)'
      },
      yaxis: [
        {
          plot: {
            value: {
              open: 'Open',
              high: 'High',
              low: 'Low',
              close: 'Close'
            },
            type: 'candlestick'
          },
          format: {
            prefix: '$'
          },
          title: 'Stock Value',
          referenceline: [
            // {
            //   label: "Controlled Temperature",
            //   value: "10"
            // }
          ],
          referencezone: [
            // {
            //   label: 'Comfortable temp. range',
            //   valuemin: '15',
            //   valuemax: '25',
            //   style: {
            //     marker: {
            //       fill: '#B4F5E6',
            //       stroke: '#B4F5E6'
            //     },
            //     'marker-text': {
            //       fill: '#000000'
            //     },
            //     'marker:hover': {
            //       fill: '#98DECD'
            //     },
            //     'marker-zone:hover': {
            //       stroke: '#B4F5E6'
            //     },
            //     'marker-notch:hover': {
            //       stroke: '#B4F5E6'
            //     }
            //   }
            // }
          ]
        }
      ],
      xaxis: {
        plot: 'Time',
        timemarker: [
        ]
      },
      navigator: {
        enabled: 0
      }
    };

    this.fetchData();
  }

  // In this method we will create our DataStore and using that we will create a custom DataTable which takes two
  // parameters, one is data another is schema.
  fetchData(): void {
    this.apiService.getPriceHistory$('SQ', this.selectedPeriod).pipe(take(1)).subscribe((response) => {
      console.log('AppComponent -> fetchData -> response', response);
      this.dataSource.caption.text = this.dataSource.caption.text.replace('[STOCK]', response.ticker);
      this.dataSource.subcaption.text = this.dataSource.subcaption.text.replace('[N]', this.selectedPeriod);

      const data = response.candles.map((candle, index) => {
        return [
          `${new Date(candle.datetime).toLocaleDateString('zh-Hans-CN')} ${new Date(candle.datetime).toLocaleTimeString('it-IT')}`,
          candle.open,
          candle.high,
          candle.low,
          candle.close,
          candle.volume
        ];
      });

      let startDate;
      let endDate;
      let skipDates = 5 - this.selectedPeriod;
      const movingAverages: number[] = [];
      let dayHigh = 0;
      let dayLow = 99999;
      let periodHigh = 0;
      let periodLow = 999999;
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      this.dataSource.xaxis.timemarker = [];
      this.dataSource.yaxis[0].referencezone = [];
      this.dataSource.yaxis[0].referenceline = [];
      response.candles.forEach((candle, index) => {
        if (endDate && new Date(candle.datetime).getDate() !== endDate.getDate() || index === response.candles.length - 1) {
          const movingAverage = (dayHigh - dayLow);
          console.log(index, dayHigh, dayLow);
          if (skipDates > 0) {
            skipDates -= 1;
          }
          else {
            this.dataSource.xaxis.timemarker.push({
              start: `${new Date(startDate).toLocaleDateString('zh-Hans-CN')} ${new Date(startDate).toLocaleTimeString('it-IT')}`,
              end: `${new Date(endDate).toLocaleDateString('zh-Hans-CN')} ${new Date(endDate).toLocaleTimeString('it-IT')}`,
              label: `${days[new Date(startDate).getDay()]} - Moving Average: $${movingAverage.toFixed(2)}`,
              timeformat: '%Y/%m/%d %H:%M:%S',
              type: 'full'
            });
            movingAverages.push(movingAverage);
          }

          startDate = undefined;
          dayHigh = 0;
          dayLow = 99999;
        }
        if (!startDate) {
          startDate = new Date(candle.datetime);
        }
        endDate = new Date(candle.datetime);

        // FOR MOVING AVERAGES
        if (skipDates <= 0) {
          if (candle.open > dayHigh) {
            dayHigh = candle.open;
          }
          if (candle.close > dayHigh) {
            dayHigh = candle.close;
          }
          if (candle.open < dayLow) {
            dayLow = candle.open;
          }
          if (candle.close < dayLow) {
            dayLow = candle.close;
          }
        }

        // FOR TRUE VALUE
        if (skipDates <= 0) {
          if (candle.open > periodHigh) {
            periodHigh = candle.open;
          }
          else if (candle.close > periodHigh) {
            periodHigh = candle.close;
          }
          if (candle.open < periodLow) {
            periodLow = candle.open;
          }
          else if (candle.close < periodLow) {
            periodLow = candle.close;
          }
        }
      });

      const TV = ((periodHigh - periodLow) * 0.63 + periodLow);
      console.log("AppComponent -> fetchData -> periodHigh", periodHigh, periodLow)
      this.dataSource.yaxis[0].referenceline.push({
        label: 'True Value',
        value: TV.toFixed(2)
      });

      const realMovingAverages = movingAverages.reduce((a, b) => {
        return a + b;
      }, 0) / movingAverages.length;

      console.log((TV + realMovingAverages + 1).toFixed(2));
      this.dataSource.yaxis[0].referencezone.push({
        label: 'Overvalued',
        valuemin: (TV + realMovingAverages + 1).toFixed(2),
        valuemax: (TV + realMovingAverages - 1).toFixed(2),
        style: {
          marker: {
            fill: '#B4F5E6',
            stroke: '#B4F5E6'
          },
          'marker-text': {
            fill: '#000000'
          },
          'marker:hover': {
            fill: '#98DECD'
          },
          'marker-zone:hover': {
            stroke: '#B4F5E6'
          },
          'marker-notch:hover': {
            stroke: '#B4F5E6'
          }
        }
      });

      this.dataSource.yaxis[0].referencezone.push({
        label: 'Undervalued',
        valuemin: (TV - realMovingAverages + 1).toFixed(2),
        valuemax: (TV - realMovingAverages - 1).toFixed(2),
        style: {
          marker: {
            fill: '#D2C9FF',
            stroke: '#D2C9FF'
          },
          'marker-text': {
            fill: '#000000'
          },
          'marker:hover': {
            fill: '#D2C9FF'
          },
          'marker-zone:hover': {
            stroke: '#D2C9FF'
          },
          'marker-notch:hover': {
            stroke: '#D2C9FF'
          }
        }
      });

      console.log(this.dataSource.xaxis.timemarker);

      // First we are creating a DataStore
      const fusionDataStore = new FusionCharts.DataStore();
      // After that we are creating a DataTable by passing our data and schema as arguments
      const fusionTable = fusionDataStore.createDataTable(data, ENV.schema);
      // Afet that we simply mutated our timeseries datasource by attaching the above
      // DataTable into its data property.
      this.dataSource.data = fusionTable;
    });
    // const jsonify = res => res.json();
    // const dataFetch = fetch(
    //   'https://s3.eu-central-1.amazonaws.com/fusion.store/ft/data/candlestick-chart-data.json'
    // ).then(jsonify);
    // const schemaFetch = fetch(
    //   'https://s3.eu-central-1.amazonaws.com/fusion.store/ft/schema/candlestick-chart-schema.json'
    // ).then(jsonify);

    // Promise.all([dataFetch, schemaFetch]).then(res => {
    //   const [data, schema] = res;
    //   // First we are creating a DataStore
    //   const fusionDataStore = new FusionCharts.DataStore();
    //   // After that we are creating a DataTable by passing our data and schema as arguments
    //   const fusionTable = fusionDataStore.createDataTable(data, schema);
    //   // Afet that we simply mutated our timeseries datasource by attaching the above
    //   // DataTable into its data property.
    //   this.dataSource.data = fusionTable;
    // });
  }

  ngOnInit(): void {
    // this.apiService.getEvents$('SQ').pipe(take(1)).subscribe((response) => {
    //   this.dataSource.chart.caption = this.dataSource.chart.caption.replace('[STOCK]', response.symbol);
    //   this.dataSource.chart.subcaption = this.dataSource.chart.subcaption.replace('[N]', (response.candles.length / 13).toString());
    //   this.dataSource.categories = [{
    //     category: response.candles.map((candle, index) => {
    //       return {
    //         label: `${new Date(candle.datetime).toLocaleDateString()}`,
    //         x: index.toString()
    //       };
    //     }).filter((candle, index) => index % 13 === 0)
    //   }];
    //   console.log(this.dataSource.categories);

    //   this.dataSource.dataset = [
    //     {
    //       data: response.candles.map((candle, index) => {
    //         return {
    //           tooltext: `<b>${new Date(candle.datetime).toLocaleTimeString()}</b><br>Open: <b>${candle.open}</b><br>Close: <b>${candle.close}</b><br>High: <b>${candle.high}</b><br>Low: <b>${candle.low}</b><br>Volume: <b>${candle.volume}</b>`,
    //           open: candle.open,
    //           high: candle.high,
    //           low: candle.low,
    //           close: candle.close,
    //           volume: candle.volume,
    //           x: index
    //         };
    //       })
    //     }
    //   ];
    // });
  }


  btnPeriodClick(selectedPeriod: number): void {
    this.selectedPeriod = selectedPeriod;
    this.fetchData();
  }
}
