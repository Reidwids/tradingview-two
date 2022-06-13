import axios from "axios";
import { GET_COIN_BARS } from "./bitquery";

// Make requests to CryptoCompare API
export async function makeApiRequest(path) {
	try {
		const queryType = path === "data/v3/all/exchanges" ? "?" : "&api_key=";
		const response = await fetch(`https://min-api.cryptocompare.com/${path}${queryType}${process.env.REACT_APP_CRYPTOCOMPARE}`);
		return response.json();
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
	}
}

export async function getCoinBars(since, till, countBack) {
	try {
		let response = await axios.post("https://graphql.bitquery.io", GET_COIN_BARS(since, till, countBack), {
			headers: {
				"X-API-KEY": "BQYmhrk9RlFLqhJwJlGuFcUwjxwKOuiA",
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error) {
		throw new Error(`Bitquery Request Error: ${error}`);
	}
}

// Generate a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
	const short = `${fromSymbol}/${toSymbol}`;
	return {
		short,
		full: `${exchange}:${short}`,
	};
}

export function parseFullSymbol(fullSymbol) {
	const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
	if (!match) {
		return null;
	}

	return { exchange: match[1], fromSymbol: match[2], toSymbol: match[3] };
}
