const CREATE_PRODUCT =
	"0x3445cfe36cb1f05fc6459c6435ec98cafeb71c3d835b976a5e24260b1a82f3";
const BUY_BATCH_PRODUCTS =
	"0xd0aa475e7a5c79fefd7165ca354e8195bdeaa90a6704c74ac1bb971bf5d02c";

type CreateProductEvent = {
	token_id: number;
	initial_stock: number;
};

type BuyProductsEvent = {
	token_ids: number[];
	token_amounts: number[];
	total_price: number;
};

class ParsedEvents {
	createProductEvents: CreateProductEvent[] = [];
	buyProductsEvents: BuyProductsEvent[] = [];

	constructor() {
		this.createProductEvents = [];
	}

	add_create_product_events(event: CreateProductEvent) {
		this.createProductEvents.push(event);
	}

	add_buy_products_events(event: BuyProductsEvent) {
		this.buyProductsEvents.push(event);
	}
}

type EventData = {
	keys: string[];
	data: string[];
};

const parseEvents = (events: EventData[]) => {
	const result = new ParsedEvents();
	for (const event of events) {
		if (event.keys[0] === CREATE_PRODUCT) {
			result.add_create_product_events(parseCreateProduct(event));
		} else if (event.keys[0] === BUY_BATCH_PRODUCTS) {
			result.add_buy_products_events(parseBuyProducts(event));
		}
	}
	return result;
};

const parseCreateProduct = (event: EventData) => {
	try {
		return {
			token_id: event.data[0] ? Number.parseInt(event.data[0], 16) : 0,
			initial_stock: event.data[2] ? Number.parseInt(event.data[2], 16) : 0,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error parsing create product event: ${error}`);
		}
		throw new Error("Error parsing create product event");
	}
};

const parseBuyProducts = (event: EventData) => {
	const token_ids = [];
	const token_amounts = [];
	let price = 0;
	try {
		const array_len = event.data[0] ? Number.parseInt(event.data[0], 16) : 0;
		for (let i = 1; i < event.data.length; i += 2) {
			let data = event.data[i];
			if (!data) {
				data = "0";
			}
			if (token_ids.length < array_len) {
				const token_id = Number.parseInt(data, 16);
				token_ids.push(token_id);
			} else if (token_amounts.length < array_len) {
				const token_amount = Number.parseInt(data, 16);
				token_amounts.push(token_amount);
			} else {
				price = price + Number.parseInt(data, 16);
			}
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error parsing buy product event: ${error}`);
		}
		throw new Error("Error parsing create product event");
	}
	return {
		token_ids: token_ids,
		token_amounts: token_amounts,
		total_price: price,
	};
};

export { parseEvents };
