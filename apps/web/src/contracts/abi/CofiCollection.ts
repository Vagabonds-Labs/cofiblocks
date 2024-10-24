const cofiCollectionABI = [
	{
		type: "constructor",
		name: "constructor",
		inputs: [{ name: "owner", type: "felt" }],
	},
	{
		type: "function",
		name: "upgrade",
		inputs: [{ name: "new_class_hash", type: "felt" }],
		outputs: [],
	},
	{
		type: "function",
		name: "burn",
		inputs: [
			{ name: "account", type: "felt" },
			{ name: "token_id", type: "u256" },
			{ name: "value", type: "u256" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "batch_burn",
		inputs: [
			{ name: "account", type: "felt" },
			{ name: "token_ids", type: "u256*" },
			{ name: "values", type: "u256*" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "batchBurn",
		inputs: [
			{ name: "account", type: "felt" },
			{ name: "tokenIds", type: "u256*" },
			{ name: "values", type: "u256*" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "mint",
		inputs: [
			{ name: "account", type: "felt" },
			{ name: "token_id", type: "u256" },
			{ name: "value", type: "u256" },
			{ name: "data", type: "felt*" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "batch_mint",
		inputs: [
			{ name: "account", type: "felt" },
			{ name: "token_ids", type: "u256*" },
			{ name: "values", type: "u256*" },
			{ name: "data", type: "felt*" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "batchMint",
		inputs: [
			{ name: "account", type: "felt" },
			{ name: "tokenIds", type: "u256*" },
			{ name: "values", type: "u256*" },
			{ name: "data", type: "felt*" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "set_base_uri",
		inputs: [{ name: "base_uri", type: "felt*" }],
		outputs: [],
	},
	{
		type: "function",
		name: "setBaseUri",
		inputs: [{ name: "baseUri", type: "felt*" }],
		outputs: [],
	},
];
