import { CandleModel } from './candle.model';

export class CandleListModel {
    constructor(
        public candles: CandleModel[],
        public lastUpdatedTime: Date,
        public ticker: string,
    ) { }
}
