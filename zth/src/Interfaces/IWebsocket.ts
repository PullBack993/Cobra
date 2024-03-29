export type IWebsocket = {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  a: number; // Aggregate trade ID
  p: string; // Price
  q: string; // Quantity
  f: number; // First trade ID
  l: number; // Last trade ID
  T: string; // Trade time
  m: boolean; // Is the buyer the market maker? BUY/SELL
  M: boolean; // Ignore
  beq: number; // Bitcoin equal quantity
  image: string;
};

export interface ITickVolume {
  symbol: string;
  volume: number;
  count?: number;
  buy: number;
  sell: number;
  image: string;
}

export interface ITick {
  symbol: string;
  count?: number;
  volume?: number;
  buy: number;
  sell: number;
  image: string;
}

export type ITickMerged = ITickVolume | ITick;
