export interface CoinExchange {
    exchangeName:       string;
    symbol:             string;
    updateTime:         number;
    turnoverNumber:     number;
    longRate:           number;
    longVolUsd:         number;
    shortRate:          number;
    shortVolUsd:        number;
    exchangeLogo:       string;
    symbolLogo:         string;
    totalVolUsd:        number;
    buyTurnoverNumber:  number;
    sellTurnoverNumber: number;
}


export interface Coin {
    symbol:       string;
    longRate:     number;
    longVolUsd:   number;
    shortRate:    number;
    shortVolUsd:  number;
    exchangeLogo: string;
    symbolLogo:   string;
    totalVolUsd:  number;
    list:         CoinExchange[];
}

export interface CombinedCoinexchange extends Coin, CoinExchange {}