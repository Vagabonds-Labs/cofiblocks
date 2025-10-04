import Image from "next/image";

// Type for contract call results - handling the Starknet Result type
type ContractResult =
	| number
	| { result?: string[]; [key: string]: unknown }
	| string[]
	| string
	| null
	| undefined;

interface UserBalancesProps {
	balances: {
		starkBalance: ContractResult;
		usdtBalance: ContractResult;
		usdcBalance: ContractResult;
	};
}

interface BalanceItem {
	label: string;
	value: number;
	icon: string;
	symbol: string;
}

// Helper function to extract numeric value from contract result
function extractBalanceValue(result: ContractResult | number): number {
	if (typeof result === "number") {
		return result;
	}

	// Handle different possible result structures
	if (result && typeof result === "object") {
		// Try different possible properties
		const hexValue = result.result?.[0] || result[0] || "0x0";
		return Number.parseInt(hexValue, 16);
	}

	return 0;
}

export function UserBalances({ balances }: UserBalancesProps) {
	const balanceItems: BalanceItem[] = [
		{
			label: "Stark",
			value: extractBalanceValue(balances.starkBalance),
			icon: "/images/logo.png",
			symbol: "STRK",
		},
		{
			label: "USDT",
			value: extractBalanceValue(balances.usdtBalance),
			icon: "/images/logo.png",
			symbol: "USDT",
		},
		{
			label: "USDC",
			value: extractBalanceValue(balances.usdcBalance),
			icon: "/images/logo.png",
			symbol: "USDC",
		},
	];

	return (
		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
			<h3 className="text-lg font-semibold text-gray-800 mb-4">
				Your Balances
			</h3>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{balanceItems.map((item) => (
					<div
						key={item.symbol}
						className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<div className="relative w-12 h-12 mb-3">
							<Image
								src={item.icon}
								alt={`${item.label} icon`}
								fill
								className="object-contain rounded-full"
							/>
						</div>
						<div className="text-center">
							<p className="text-sm font-medium text-gray-600 mb-1">
								{item.label}
							</p>
							<p className="text-lg font-bold text-gray-800">
								{item.value.toLocaleString()}
							</p>
							<p className="text-xs text-gray-500">{item.symbol}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
