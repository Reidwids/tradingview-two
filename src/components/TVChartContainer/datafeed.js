import axios from "axios";
import * as Bitquery from "./bitquery";

const lastBarsCache = new Map();
const configurationData = {
	supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
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
		console.log("[resolveSymbol]: Method called!!");
		const headers = {
			"Content-Type": "application/json",
			"X-API-KEY": process.env.REACT_APP_BITQUERY,
		};
		const graphqlQuery = {
			operationName: "GET_COIN_INFO",
			query: `query GET_COIN_INFO ${Bitquery.GET_COIN_INFO}`,
			variables: { tokenAddress: symbolName },
		};
		const response = await axios({
			url: Bitquery.endpoint,
			method: "post",
			mode: "cors",
			headers: headers,
			data: graphqlQuery,
		});
		console.log(response.data.data.ethereum.dexTrades[0].baseCurrency);

		const coin = response.data.data.ethereum.dexTrades[0].baseCurrency;
		if (!coin) {
			onResolveErrorCallback();
		} else {
			const symbol = {
				ticker: symbolName,
				name: `${coin.symbol}/USD`,
				session: "24x7",
				timezone: "Etc/UTC",
				minmov: 1,
				pricescale: 1000,
				has_intraday: true,
				intraday_multipliers: ["1", "5", "15", "30", "60"],
				has_empty_bars: true,
				has_weekly_and_monthly: false,
				supported_resolutions: configurationData.supported_resolutions,
				volume_precision: 1,
				data_status: "streaming",
			};
			//onSymbolResolvedCallback(symbol);
			onSymbolResolvedCallback(symbol);
		}
	},
	// This method is used by the charting library to get historical data for the symbol.
	getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
		try {
			if (resolution === "1D") {
				resolution = 1440;
			}
			if (resolution === "1W") {
				resolution = 10080;
			}
			if (resolution === "1M") {
				resolution = 43800;
			}

			const { from, to, firstDataRequest, countBack } = periodParams;
			const currentDate = new Date();
			const intervalDate = new Date(currentDate - resolution * 60000 * countBack);
			const headers = {
				"Content-Type": "application/json",
				"X-API-KEY": process.env.REACT_APP_BITQUERY,
			};
			const graphqlQuery = {
				operationName: "GET_COIN_BARS",
				query: `query GET_COIN_BARS ${Bitquery.GET_COIN_BARS(intervalDate.toISOString(), currentDate.toISOString(), resolution, countBack)}`,
				variables: {
					from: intervalDate.toISOString(),
					to: currentDate.toISOString(),
					interval: Number(resolution),
					tokenAddress: symbolInfo.ticker,
				},
			};
			const response2 = await axios({
				url: Bitquery.endpoint,
				method: "post",
				mode: "cors",
				headers: headers,
				data: graphqlQuery,
			});

			// console.log("******************");
			// console.log(new Date(response2.data.data.ethereum.dexTrades[0].timeInterval.second));
			// console.log(new Date(response2.data.data.ethereum.dexTrades[0].timeInterval.minute).getTime() - new Date(response2.data.data.ethereum.dexTrades[0].timeInterval.minute).getTimezoneOffset() * 60000);

			const bars = response2.data.data.ethereum.dexTrades.map((el) => ({
				time: new Date(el.timeInterval.minute).getTime(), // date string in api response
				low: el.low,
				high: el.high,
				open: Number(el.open),
				close: Number(el.close),
				volume: el.volume,
			}));
			// console.log(bars.slice(bars.length - countBack));
			console.log("*****************REPORT********************");
			console.log(bars);
			console.log("[getBars]: Method call", symbolInfo, resolution, new Date(from), new Date(to), countBack);

			if (bars.length > 1) {
				onHistoryCallback(bars, { noData: false });
			} else {
				onHistoryCallback([], { noData: true });
			}
		} catch (err) {
			console.log({ err });
			// onErrorCallback(err)
		}
	},
	subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeID, onResetCacheNeededCallback) => {},
	unsubscribeBars: (subscribeID) => {},
};
