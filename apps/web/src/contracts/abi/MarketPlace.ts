export const marketPlaceABI = [
	{
		type: "impl",
		name: "MarketplaceImpl",
		interface_name: "contracts::marketplace::IMarketplace",
	},
	{
		type: "struct",
		name: "core::integer::u256",
		members: [
			{
				name: "low",
				type: "core::integer::u128",
			},
			{
				name: "high",
				type: "core::integer::u128",
			},
		],
	},
	{
		type: "struct",
		name: "core::array::Span::<core::integer::u256>",
		members: [
			{
				name: "snapshot",
				type: "@core::array::Array::<core::integer::u256>",
			},
		],
	},
	{
		type: "struct",
		name: "core::array::Span::<core::felt252>",
		members: [
			{
				name: "snapshot",
				type: "@core::array::Array::<core::felt252>",
			},
		],
	},
	{
		type: "interface",
		name: "contracts::marketplace::IMarketplace",
		items: [
			{
				type: "function",
				name: "assign_seller_role",
				inputs: [
					{
						name: "assignee",
						type: "core::starknet::contract_address::ContractAddress",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "assign_consumer_role",
				inputs: [
					{
						name: "assignee",
						type: "core::starknet::contract_address::ContractAddress",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "assign_admin_role",
				inputs: [
					{
						name: "assignee",
						type: "core::starknet::contract_address::ContractAddress",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "buy_product",
				inputs: [
					{
						name: "token_id",
						type: "core::integer::u256",
					},
					{
						name: "token_amount",
						type: "core::integer::u256",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "buy_products",
				inputs: [
					{
						name: "token_ids",
						type: "core::array::Span::<core::integer::u256>",
					},
					{
						name: "token_amount",
						type: "core::array::Span::<core::integer::u256>",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "create_product",
				inputs: [
					{
						name: "initial_stock",
						type: "core::integer::u256",
					},
					{
						name: "price",
						type: "core::integer::u256",
					},
					{
						name: "data",
						type: "core::array::Span::<core::felt252>",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "create_products",
				inputs: [
					{
						name: "initial_stock",
						type: "core::array::Span::<core::integer::u256>",
					},
					{
						name: "price",
						type: "core::array::Span::<core::integer::u256>",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "delete_product",
				inputs: [
					{
						name: "token_id",
						type: "core::integer::u256",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "delete_products",
				inputs: [
					{
						name: "token_ids",
						type: "core::array::Span::<core::integer::u256>",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "claim",
				inputs: [],
				outputs: [],
				state_mutability: "external",
			},
		],
	},
	{
		type: "impl",
		name: "ERC1155ReceiverImpl",
		interface_name: "openzeppelin_token::erc1155::interface::IERC1155Receiver",
	},
	{
		type: "interface",
		name: "openzeppelin_token::erc1155::interface::IERC1155Receiver",
		items: [
			{
				type: "function",
				name: "on_erc1155_received",
				inputs: [
					{
						name: "operator",
						type: "core::starknet::contract_address::ContractAddress",
					},
					{
						name: "from",
						type: "core::starknet::contract_address::ContractAddress",
					},
					{
						name: "token_id",
						type: "core::integer::u256",
					},
					{
						name: "value",
						type: "core::integer::u256",
					},
					{
						name: "data",
						type: "core::array::Span::<core::felt252>",
					},
				],
				outputs: [
					{
						type: "core::felt252",
					},
				],
				state_mutability: "view",
			},
			{
				type: "function",
				name: "on_erc1155_batch_received",
				inputs: [
					{
						name: "operator",
						type: "core::starknet::contract_address::ContractAddress",
					},
					{
						name: "from",
						type: "core::starknet::contract_address::ContractAddress",
					},
					{
						name: "token_ids",
						type: "core::array::Span::<core::integer::u256>",
					},
					{
						name: "values",
						type: "core::array::Span::<core::integer::u256>",
					},
					{
						name: "data",
						type: "core::array::Span::<core::felt252>",
					},
				],
				outputs: [
					{
						type: "core::felt252",
					},
				],
				state_mutability: "view",
			},
		],
	},
	{
		type: "impl",
		name: "SRC5Impl",
		interface_name: "openzeppelin_introspection::interface::ISRC5",
	},
	{
		type: "enum",
		name: "core::bool",
		variants: [
			{
				name: "False",
				type: "()",
			},
			{
				name: "True",
				type: "()",
			},
		],
	},
	{
		type: "interface",
		name: "openzeppelin_introspection::interface::ISRC5",
		items: [
			{
				type: "function",
				name: "supports_interface",
				inputs: [
					{
						name: "interface_id",
						type: "core::felt252",
					},
				],
				outputs: [
					{
						type: "core::bool",
					},
				],
				state_mutability: "view",
			},
		],
	},
	{
		type: "impl",
		name: "AccessControlImpl",
		interface_name:
			"openzeppelin_access::accesscontrol::interface::IAccessControl",
	},
	{
		type: "interface",
		name: "openzeppelin_access::accesscontrol::interface::IAccessControl",
		items: [
			{
				type: "function",
				name: "has_role",
				inputs: [
					{
						name: "role",
						type: "core::felt252",
					},
					{
						name: "account",
						type: "core::starknet::contract_address::ContractAddress",
					},
				],
				outputs: [
					{
						type: "core::bool",
					},
				],
				state_mutability: "view",
			},
			{
				type: "function",
				name: "get_role_admin",
				inputs: [
					{
						name: "role",
						type: "core::felt252",
					},
				],
				outputs: [
					{
						type: "core::felt252",
					},
				],
				state_mutability: "view",
			},
			{
				type: "function",
				name: "grant_role",
				inputs: [
					{
						name: "role",
						type: "core::felt252",
					},
					{
						name: "account",
						type: "core::starknet::contract_address::ContractAddress",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "revoke_role",
				inputs: [
					{
						name: "role",
						type: "core::felt252",
					},
					{
						name: "account",
						type: "core::starknet::contract_address::ContractAddress",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
			{
				type: "function",
				name: "renounce_role",
				inputs: [
					{
						name: "role",
						type: "core::felt252",
					},
					{
						name: "account",
						type: "core::starknet::contract_address::ContractAddress",
					},
				],
				outputs: [],
				state_mutability: "external",
			},
		],
	},
	{
		type: "constructor",
		name: "constructor",
		inputs: [
			{
				name: "cofi_collection_address",
				type: "core::starknet::contract_address::ContractAddress",
			},
			{
				name: "admin",
				type: "core::starknet::contract_address::ContractAddress",
			},
			{
				name: "market_fee",
				type: "core::integer::u256",
			},
		],
	},
	{
		type: "event",
		name: "openzeppelin_token::erc1155::erc1155_receiver::ERC1155ReceiverComponent::Event",
		kind: "enum",
		variants: [],
	},
	{
		type: "event",
		name: "openzeppelin_introspection::src5::SRC5Component::Event",
		kind: "enum",
		variants: [],
	},
	{
		type: "event",
		name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
		kind: "struct",
		members: [
			{
				name: "role",
				type: "core::felt252",
				kind: "data",
			},
			{
				name: "account",
				type: "core::starknet::contract_address::ContractAddress",
				kind: "data",
			},
			{
				name: "sender",
				type: "core::starknet::contract_address::ContractAddress",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
		kind: "struct",
		members: [
			{
				name: "role",
				type: "core::felt252",
				kind: "data",
			},
			{
				name: "account",
				type: "core::starknet::contract_address::ContractAddress",
				kind: "data",
			},
			{
				name: "sender",
				type: "core::starknet::contract_address::ContractAddress",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
		kind: "struct",
		members: [
			{
				name: "role",
				type: "core::felt252",
				kind: "data",
			},
			{
				name: "previous_admin_role",
				type: "core::felt252",
				kind: "data",
			},
			{
				name: "new_admin_role",
				type: "core::felt252",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
		kind: "enum",
		variants: [
			{
				name: "RoleGranted",
				type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
				kind: "nested",
			},
			{
				name: "RoleRevoked",
				type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
				kind: "nested",
			},
			{
				name: "RoleAdminChanged",
				type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
				kind: "nested",
			},
		],
	},
	{
		type: "event",
		name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
		kind: "struct",
		members: [
			{
				name: "class_hash",
				type: "core::starknet::class_hash::ClassHash",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
		kind: "enum",
		variants: [
			{
				name: "Upgraded",
				type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
				kind: "nested",
			},
		],
	},
	{
		type: "event",
		name: "contracts::marketplace::Marketplace::DeleteProduct",
		kind: "struct",
		members: [
			{
				name: "token_id",
				type: "core::integer::u256",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "contracts::marketplace::Marketplace::CreateProduct",
		kind: "struct",
		members: [
			{
				name: "token_id",
				type: "core::integer::u256",
				kind: "data",
			},
			{
				name: "initial_stock",
				type: "core::integer::u256",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "contracts::marketplace::Marketplace::UpdateStock",
		kind: "struct",
		members: [
			{
				name: "token_id",
				type: "core::integer::u256",
				kind: "data",
			},
			{
				name: "new_stock",
				type: "core::integer::u256",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "contracts::marketplace::Marketplace::BuyProduct",
		kind: "struct",
		members: [
			{
				name: "token_id",
				type: "core::integer::u256",
				kind: "data",
			},
			{
				name: "amount",
				type: "core::integer::u256",
				kind: "data",
			},
			{
				name: "price",
				type: "core::integer::u256",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "contracts::marketplace::Marketplace::BuyBatchProducts",
		kind: "struct",
		members: [
			{
				name: "token_ids",
				type: "core::array::Span::<core::integer::u256>",
				kind: "data",
			},
			{
				name: "token_amount",
				type: "core::array::Span::<core::integer::u256>",
				kind: "data",
			},
			{
				name: "total_price",
				type: "core::integer::u256",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "contracts::marketplace::Marketplace::PaymentSeller",
		kind: "struct",
		members: [
			{
				name: "token_ids",
				type: "core::array::Span::<core::integer::u256>",
				kind: "data",
			},
			{
				name: "seller",
				type: "core::starknet::contract_address::ContractAddress",
				kind: "data",
			},
			{
				name: "payment",
				type: "core::integer::u256",
				kind: "data",
			},
		],
	},
	{
		type: "event",
		name: "contracts::marketplace::Marketplace::Event",
		kind: "enum",
		variants: [
			{
				name: "ERC1155ReceiverEvent",
				type: "openzeppelin_token::erc1155::erc1155_receiver::ERC1155ReceiverComponent::Event",
				kind: "flat",
			},
			{
				name: "SRC5Event",
				type: "openzeppelin_introspection::src5::SRC5Component::Event",
				kind: "flat",
			},
			{
				name: "AccessControlEvent",
				type: "openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::Event",
				kind: "flat",
			},
			{
				name: "UpgradeableEvent",
				type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
				kind: "flat",
			},
			{
				name: "DeleteProduct",
				type: "contracts::marketplace::Marketplace::DeleteProduct",
				kind: "nested",
			},
			{
				name: "CreateProduct",
				type: "contracts::marketplace::Marketplace::CreateProduct",
				kind: "nested",
			},
			{
				name: "UpdateStock",
				type: "contracts::marketplace::Marketplace::UpdateStock",
				kind: "nested",
			},
			{
				name: "BuyProduct",
				type: "contracts::marketplace::Marketplace::BuyProduct",
				kind: "nested",
			},
			{
				name: "BuyBatchProducts",
				type: "contracts::marketplace::Marketplace::BuyBatchProducts",
				kind: "nested",
			},
			{
				name: "PaymentSeller",
				type: "contracts::marketplace::Marketplace::PaymentSeller",
				kind: "nested",
			},
		],
	},
];
