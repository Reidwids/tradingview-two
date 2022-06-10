// Make requests to CryptoCompare API
export async function makeApiRequest(path) {
	try {
		console.log("******************************");
		console.log("PATH: ", path);
		console.log(process.env.REACT_APP_CRYPTOCOMPARE);
		console.log(`https://min-api.cryptocompare.com/${path}&api_key=${process.env.REACT_APP_CRYPTOCOMPARE}`);

		const response = await fetch(`https://min-api.cryptocompare.com/${path}`);
		return response.json();
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
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
