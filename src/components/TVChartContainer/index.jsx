import * as React from "react";
import "./index.css";
import { widget } from "../../charting_library";
import Datafeed from "./datafeed";

function getLanguageFromURL() {
	const regex = new RegExp("[\\?&]lang=([^&#]*)");
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export class TVChartContainer extends React.PureComponent {
	static defaultProps = {
		chain: "Binance",
		token1: "BTC",
		token2: "USDT",
		interval: "15",
		// datafeedUrl: 'https://demo_feed.tradingview.com',
		libraryPath: "/charting_library/",
		chartsStorageUrl: "https://saveload.tradingview.com",
		chartsStorageApiVersion: "1.1",
		clientId: "tradingview.com",
		userId: "public_user_id",
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	tvWidget = null;

	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}

	componentDidMount() {
		const widgetOptions = {
			symbol: `${this.props.chain}:${this.props.token1}/${this.props.token2}`,
			// BEWARE: no trailing slash is expected in feed URL
			// datafeed: new window.Datafeeds.UDFCompatibleDatafeed(this.props.datafeedUrl),
			datafeed: Datafeed,
			interval: this.props.interval,
			container: this.ref.current,
			library_path: this.props.libraryPath,
			debug: true,
			locale: getLanguageFromURL() || "en",
			disabled_features: ["use_localstorage_for_settings"],
			enabled_features: ["study_templates"],
			charts_storage_url: this.props.chartsStorageUrl,
			charts_storage_api_version: this.props.chartsStorageApiVersion,
			client_id: this.props.clientId,
			user_id: this.props.userId,
			fullscreen: this.props.fullscreen,
			autosize: this.props.autosize,
			studies_overrides: this.props.studiesOverrides,
			time_frames: [
				{ text: "3y", resolution: "1W", description: "3 Years", title: "3yr" },
				{ text: "1y", resolution: "1D", description: "1 Year" },
				{ text: "6m", resolution: "1D", description: "6 Month" },
				{ text: "3m", resolution: "1D", description: "3 Month" },
				{ text: "1m", resolution: "60", description: "1 Month" },
				{ text: "1w", resolution: "60", description: "1 Week" },
				{ text: "3d", resolution: "60", description: "3 Days" },
				{ text: "1d", resolution: "15", description: "1 Day" },
				{ text: "3h", resolution: "5", description: "3 Hours" },
				{ text: "1h", resolution: "1", description: "1 Hours" },
			],
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;

		tvWidget.onChartReady(() => {
			tvWidget.headerReady().then(() => {
				const button = tvWidget.createButton();
				button.setAttribute("title", "Click to show a notification popup");
				button.classList.add("apply-common-tooltip");
				button.addEventListener("click", () =>
					tvWidget.showNoticeDialog({
						title: "Notification",
						body: "TradingView Charting Library API works correctly",
						callback: () => {
							console.log("Noticed!");
						},
					})
				);

				button.innerHTML = "Check API";
			});
		});
	}

	componentWillUnmount() {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
	}

	render() {
		return <div ref={this.ref} className={"TVChartContainer"} />;
	}
}
