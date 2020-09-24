export class CandleModel {
    constructor(
        public close: number,
        public datetime: number,
        public high: number,
        public low: number,
        public open: number,
        public volume: number,
    ) { }
}
