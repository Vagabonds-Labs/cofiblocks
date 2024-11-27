export type CheckoutState = {
	checkoutStep: string;
	deliveryMethod: string;
	deliveryLocation: string;
	deliveryAddress: {
		street: string;
		apartment: string;
		city: string;
		zipCode: string;
	};
	selectedCurrency: string;
};

export type CheckoutAction =
	| { type: "SET_STEP"; payload: string }
	| { type: "SET_DELIVERY_METHOD"; payload: string }
	| { type: "SET_DELIVERY_LOCATION"; payload: string }
	| { type: "SET_DELIVERY_ADDRESS"; payload: CheckoutState["deliveryAddress"] }
	| { type: "SET_CURRENCY"; payload: string };

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
		case "SET_CURRENCY":
			return { ...state, selectedCurrency: action.payload };
		default:
			return state;
	}
}
