import axios from "axios";
import * as Bitquery from "./bitquery";
import { makeApiRequest, generateSymbol, parseFullSymbol, getCoinBars } from "./helpers.js";
import { subscribeOnStream, unsubscribeFromStream } from "./streaming.js";
import moment from "moment";

var requestCounter = 0;

const lastBarsCache = new Map();

const configurationData = {
	supported_resolutions: ["1", "3", "5", "15", "30", "60", "1D", "1W", "1M"],

	//Default Exchanges
	exchanges: [
		{
			// `exchange` argument for the `searchSymbols` method, if a user selects this exchange
			value: "Binance",
			// filter name
			name: "Binance",
			// full exchange name displayed in the filter popup
			desc: "Binance",
		},
		{
			// `exchange` argument for the `searchSymbols` method, if a user selects this exchange
			value: "Gateio",
			// filter name
			name: "Gateio",
			// full exchange name displayed in the filter popup
			desc: "Gateio",
		},
	],
	// symbols_types: [
	// 	{
	// 		name: "crypto",

	// 		// `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
	// 		value: "crypto",
	// 	},
	// 	// ...
	// ],
};

export default {
	// This method is used by the Charting Library to get a configuration of your datafeed
	// (e.g. supported resolutions, exchanges and so on)
	onReady: (callback) => {
		console.log("[onReady]: Method called!!");
		setTimeout(() => callback(configurationData));
	},

	// This method is used by the library to retrieve information about a specific symbol
	// (exchange, price scale, full symbol etc.).
	resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
		console.log("[resolveSymbol]: Method call", symbolName);
		let regexExchange = /^[^:]*/;
		let regexToken1 = /:\w*/;
		//let exchange = symbolName.match(regexExchange)[0];
		// let token1 = symbolName.match(regexToken1)[0].slice(1);
		/*let symbols = await getAllSymbols(exchange);
    let symbolItem = symbols.find(({ full_name }) => full_name === symbolName);
    if (!symbolItem) {
      // If pair doesn't exist on given exchange, default to another
      const exchangeFallback = await getExchange(token1);
      symbols = await getAllSymbols(exchangeFallback);
      symbolName = symbolName.replace(regexExchange, exchangeFallback);
      symbolItem = symbols.find(({ full_name }) => full_name === symbolName);
      if (!symbolItem) {
        console.log("[resolveSymbol]: Cannot resolve symbol", symbolName);
        onResolveErrorCallback("cannot resolve symbol");
        return;
      }
    }*/

		const symbolItem = {
			full_name: "test:test/test",
			symbol: "test",
			description: "test",
			type: "test",
			exchange: "test",
		};

		const symbolInfo = {
			ticker: symbolItem.full_name,
			name: symbolItem.symbol,
			description: symbolItem.description,
			type: symbolItem.type,
			session: "24x7",
			timezone: "Etc/UTC",
			exchange: symbolItem.exchange,
			minmov: 1,
			//Decimal places on chart
			pricescale: 100000000000,
			// has_intraday: false,
			has_intraday: true,
			// intraday bar resolutions, note higher resolutions can be built from these
			intraday_multipliers: ["1", "60"],
			// has_no_volume: true,
			has_weekly_and_monthly: false,
			supported_resolutions: configurationData.supported_resolutions,
			volume_precision: 2,
			data_status: "streaming",
		};

		console.log("[resolveSymbol]: Symbol resolved", symbolName);
		onSymbolResolvedCallback(symbolInfo);
	},

	// This method is used by the charting library to get historical data for the symbol.
	getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
		requestCounter++;

		console.log("REQUEST COUNTER");
		console.log(requestCounter);

		const { from, to, firstDataRequest, countBack } = periodParams;
		const since = moment.unix(periodParams.from).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
		// const till = moment.unix(periodParams.to).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
		const till = moment().format("YYYY-MM-DDTHH:mm:ss") + "Z";
		console.log("today!!!!!!!!!!!!!!!!!!!!!!!!!!!!: ", till);

		console.log("[getBars]: Method call", symbolInfo, resolution, from, to);

		console.log("PERIOD PARAMS");
		console.log(periodParams);

		console.log("SINCE");
		console.log(since);

		console.log("TILL");
		console.log(till);

		if (requestCounter === 5) {
			onHistoryCallback([], { noData: true });
			return;
		}

		try {
			console.log("COUNTBACKKKKKKK: ", countBack);
			const data = await getCoinBars(since, till, countBack);
			console.log("BITQUERY DATA");
			console.log(data);

			let bars = [];
			data.data.ethereum.dexTrades.forEach((trade) => {
				bars = [
					...bars,
					{
						time: moment(trade.timeInterval.minute).unix() * 1000,
						low: trade.minimum_price,
						high: trade.maximum_price,
						open: Number(trade.open_price),
						close: Number(trade.close_price),
					},
				];
			});

			console.log(bars);

			/*if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, { ...bars[bars.length - 1] });
      }
      console.log(`[getBars]: returned ${bars.length} bar(s)`);
      onHistoryCallback(bars, { noData: false });*/
			//onHistoryCallback(bars, { noData: false });
			if (bars.length < 1) {
				onHistoryCallback([], { noData: true });
			} else {
				onHistoryCallback(bars, { noData: false });
			}
		} catch (error) {
			console.log("[getBars]: Get error", error);
			onErrorCallback(error);
		}
	},
	subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
		console.log("[subscribeBars]: Method call with subscribeUID:", subscribeUID);
		/*subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.full_name)
    );*/
	},

	unsubscribeBars: (subscriberUID) => {
		console.log("[unsubscribeBars]: Method call with subscriberUID:", subscriberUID);
		//unsubscribeFromStream(subscriberUID);
	},

	//Utility functions
	getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
		//optional
		console.log("=====getTimeScaleMarks running");
	},
	calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
		//optional
		console.log("=====calculateHistoryDepth running");
		// while optional, this makes sure we request 24 hours of minute data at a time
		// CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
		return resolution < 60 ? { resolutionBack: "D", intervalBack: "1" } : undefined;
	},
	searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
		console.log("[searchSymbols]: Method call");
		const symbols = await getAllSymbols(exchange);
		const newSymbols = symbols.filter((symbol) => {
			const isExchangeValid = exchange === "" || symbol.exchange === exchange;
			const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
			return isExchangeValid && isFullSymbolContainsInput;
		});
		onResultReadyCallback(newSymbols);
	},
};
