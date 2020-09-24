import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError as ObservableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { CandleListModel } from './models/candle-list.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getPriceHistory$(symbol: string, period: number = 3): Observable<CandleListModel> {
    return this.http.get<CandleListModel>(`${ENV.BASE_API}pricehistory/${symbol}/${period}`)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET price history for a symbol, default is the last 3 days
  // getEvents$(symbol: string, period: number = 3): Observable<CandleListModel> {
  //   const endpoint = `https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory`;
  //   const d = new Date();
  //   const date = d.getDate();
  //   const month = d.getMonth() + 1;
  //   const year = d.getFullYear();

  //   let base = 0;
  //   const yesterday = new Date(year, month - 1, date - 1);
  //   while (yesterday.getDay() === 6 || yesterday.getDay() === 0) {
  //     base += 1;
  //     yesterday.setDate(yesterday.getDate() - 1);
  //   }

  //   // console.log(date + '/' + month + '/' + year);
  //   // console.log(new Date(year, month - 1, date));
  //   const startDate = new Date();
  //   startDate.setDate(yesterday.getDate() - (period - 1));
  //   const endDate = yesterday;

  //   const payload = {
  //     apikey: ENV.client_id,
  //     periodType: 'day',
  //     frequencyType: 'minute',
  //     frequency: '30',
  //     period: period.toString(),
  //     startDate: startDate.getTime().toString(),
  //     endDate: endDate.getTime().toString(),
  //     needExtendedHoursData: 'true'
  //   };

  //   return this.http
  //     .get<CandleListModel>(endpoint, { params: payload })
  //     .pipe(
  //       catchError((error) => this._handleError(error))
  //     );
  // }

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    console.error(errorMsg);
    return ObservableThrowError(errorMsg);
  }
}
