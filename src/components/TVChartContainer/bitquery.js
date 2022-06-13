export const endpoint = "https://graphql.bitquery.io";

export const GET_COIN_INFO = `
{
  ethereum(network: bsc) {
    dexTrades(
      options: {desc: ["block.height", "transaction.index"], limit: 1}
      exchangeAddress: {is: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"}
      baseCurrency: {is: "0x2170ed0880ac9a755fd29b2688956bd959f933f8"}
      quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
    ) 
    {
      block {
        height
        timestamp {
          time(format: "%Y-%m-%d %H:%M:%S") 
        }
      }
      transaction {
        index
      }
      baseCurrency {
        name
        symbol
        decimals
      }
      quotePrice
    }
  }
}
`;

export const GET_COIN_BARS = (since, till) => {
  return JSON.stringify({
    query: `{
      ethereum(network: bsc) {
        dexTrades(options: {asc: "timeInterval.minute", limit: 1000}, 
          date: {since: "${since}", till:"${till}"}
          exchangeName: {is: "Pancake v2"}, 
          baseCurrency: {is: "0x9B3a01F8b4aBD2E2a74597B21b7C269ABf4E9f41"}, 
          quoteCurrency: {is: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"}) {
          
          
          timeInterval {
            minute(count: 1)
          }
    
        
          baseCurrency {
            symbol
            address
          }
          baseAmount
          quoteCurrency {
            symbol
            address
          }
          quoteAmount
          
          trades: count
          quotePrice
          
          maximum_price: quotePrice(calculate: maximum)
          minimum_price: quotePrice(calculate: minimum)
                median_price: quotePrice(calculate: median)
    
          open_price: minimum(of: block get: quote_price)
          close_price: maximum(of: block get: quote_price)
      
        }
      }
    }`,
  });
};
`;
};

// `;
// {
//   ethereum(network: bsc) {
//     dexTrades(
//       options: {asc: "timeInterval.minute"}
//       date: {since: "${dateFrom}", till: "${dateTo}"}
// time: {since: "${dateFrom}", till: "${dateTo}"}
//       exchangeAddress: {is: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"}
//       baseCurrency: {is: "0x2170ed0880ac9a755fd29b2688956bd959f933f8"},
//       quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"},
//       tradeAmountUsd: {gt: 10}
//     )
//     {
//       timeInterval {
//         minute(count: ${interval}, format: "%Y-%m-%dT%H:%M:%SZ")
//       }
//       volume: quoteAmount
//       high: quotePrice(calculate: maximum)
//       low: quotePrice(calculate: minimum)
//       open: minimum(of: block, get: quote_price)
//       close: maximum(of: block, get: quote_price)
//     }
//   }
// }
// `
