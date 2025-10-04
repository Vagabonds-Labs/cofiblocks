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
		claimBalance?: number;
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
		// Check if it's an array
		if (Array.isArray(result)) {
			const hexValue = result[0] || "0x0";
			return Number.parseInt(hexValue, 16);
		}

		// Check if it has a result property
		if ("result" in result && Array.isArray(result.result)) {
			const hexValue = result.result[0] || "0x0";
			return Number.parseInt(hexValue, 16);
		}
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

			{/* Claim Balance Section */}
			{balances.claimBalance !== undefined && balances.claimBalance > 0 && (
				<div className="mt-6 pt-6 border-t border-gray-200">
					<h4 className="text-lg font-semibold text-gray-800 mb-4">
						Claim Balance
					</h4>
					<div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
						<div className="flex items-center space-x-3">
							<div className="relative w-10 h-10">
								<Image
									src="/images/logo.png"
									alt="USDT icon"
									fill
									className="object-contain rounded-full"
								/>
							</div>
							<div>
								<p className="text-lg font-bold text-green-800">
									{balances.claimBalance.toLocaleString()} USDT
								</p>
								<p className="text-sm text-green-600">Available to claim</p>
							</div>
						</div>
						<button
							type="button"
							className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
						>
							Claim
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
