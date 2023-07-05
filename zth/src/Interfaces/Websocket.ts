export type Websocket = {
    e: string,    // Event type
    E: number,    // Event time
    s: string,    // Symbol
    a: number,    // Aggregate trade ID
    p: string,    // Price
    q: string,    // Quantity
    f: number,    // First trade ID
    l: number,    // Last trade ID
    T: number,    // Trade time
    m: boolean,   // Is the buyer the market maker? BUY/SELL
    M: boolean,   // Ignore
    beq: number,  // Bitcoin equal quantity
  }