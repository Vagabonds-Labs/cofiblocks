export interface CheckoutState {
	checkoutStep: "delivery" | "address" | "review";
	deliveryMethod: string;
	deliveryLocation: string;
	deliveryAddress: {
		street: string;
		apartment: string;
		city: string;
		zipCode: string;
	};
	selectedCurrency: string;
	deliveryPrice: number;
	isConfirmed: boolean;
}

export type CheckoutAction =
	| { type: "SET_STEP"; payload: CheckoutState["checkoutStep"] }
	| { type: "SET_DELIVERY_METHOD"; payload: string }
	| { type: "SET_DELIVERY_LOCATION"; payload: string }
	| { type: "SET_DELIVERY_ADDRESS"; payload: CheckoutState["deliveryAddress"] }
	| { type: "SET_SELECTED_CURRENCY"; payload: string }
	| { type: "SET_CURRENCY"; payload: string }
	| { type: "SET_DELIVERY_PRICE"; payload: number }
	| { type: "CONFIRM_ORDER" };

export const initialState: CheckoutState = {
	checkoutStep: "delivery",
	deliveryMethod: "",
	deliveryLocation: "",
	deliveryAddress: {
		street: "",
		apartment: "",
		city: "",
		zipCode: "",
	},
	selectedCurrency: "USD",
	deliveryPrice: 0,
	isConfirmed: false,
};

export function CheckoutReducer(
	state: CheckoutState,
	action: CheckoutAction,
): CheckoutState {
	switch (action.type) {
		case "SET_STEP":
			return { ...state, checkoutStep: action.payload };
		case "SET_DELIVERY_METHOD":
			return { ...state, deliveryMethod: action.payload };
		case "SET_DELIVERY_LOCATION":
			return { ...state, deliveryLocation: action.payload };
		case "SET_DELIVERY_ADDRESS":
			return { ...state, deliveryAddress: action.payload };
		case "SET_SELECTED_CURRENCY":
			return { ...state, selectedCurrency: action.payload };
		case "SET_CURRENCY":
			return { ...state, selectedCurrency: action.payload };
		case "SET_DELIVERY_PRICE":
			return { ...state, deliveryPrice: action.payload };
		case "CONFIRM_ORDER":
			return { ...state, isConfirmed: true };
		default:
			return state;
	}
}
