import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Modal from "@repo/ui/modal";
import InputField from "@repo/ui/form/inputField";
import Button from "@repo/ui/button";
import { api } from "~/trpc/react";

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

interface WithdrawalFormData {
	walletAddress: string;
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
			const hexValue = result[0] ?? "0x0";
			return Number.parseInt(hexValue, 16);
		}

		// Check if it has a result property
		if ("result" in result && Array.isArray(result.result)) {
			const hexValue = result.result[0] ?? "0x0";
			return Number.parseInt(hexValue, 16);
		}
	}

	return 0;
}

export function UserBalances({ balances }: UserBalancesProps) {
	const { t } = useTranslation();
	const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
	const [selectedBalance, setSelectedBalance] = useState<BalanceItem | null>(null);
	
	const { control, handleSubmit, reset, watch } = useForm<WithdrawalFormData>({
		defaultValues: {
			walletAddress: "",
		},
	});

	const withdrawTokenMutation = api.user.withdrawToken.useMutation({
		onSuccess: () => {
			// Close modal and reset form on success
			setIsWithdrawalModalOpen(false);
			setSelectedBalance(null);
			reset();
		},
		onError: (error) => {
			console.error("Withdrawal failed:", error);
		},
	});

	const claimBalanceMutation = api.user.claim.useMutation({
		onSuccess: () => {
			console.log("Balance claimed successfully!");
			// You might want to refresh the balances or show a success message
		},
		onError: (error) => {
			console.error("Claim failed:", error);
		},
	});

	// Watch the wallet address field to validate it
	const walletAddress = watch("walletAddress");
	
	// Validate wallet address: starts with "0x" and has 32 characters after (66 total)
	const isValidWalletAddress = walletAddress && 
		walletAddress.startsWith("0x") && 
		walletAddress.length === 66;

	const balanceItems: BalanceItem[] = [
		{
			label: "STRK",
			value: extractBalanceValue(balances.starkBalance),
			icon: "/images/balances/strk-svg.svg",
			symbol: "STRK",
		},
		{
			label: "USDT",
			value: extractBalanceValue(balances.usdtBalance),
			icon: "/images/balances/tether-usdt-logo.svg",
			symbol: "USDT",
		},
		{
			label: "USDC",
			value: extractBalanceValue(balances.usdcBalance),
			icon: "/images/balances/usd-coin-usdc-logo.svg",
			symbol: "USDC",
		},
	];

	const handleBalanceClick = (balance: BalanceItem) => {
		// Prevent modal from opening if balance is 0
		if (balance.value <= 0) {
			return;
		}
		setSelectedBalance(balance);
		setIsWithdrawalModalOpen(true);
	};

	const handleWithdraw = (data: WithdrawalFormData) => {
		if (!selectedBalance || !isValidWalletAddress) {
			return;
		}

		// Call the tRPC mutation
		withdrawTokenMutation.mutate({
			token: selectedBalance.symbol as "STRK" | "USDC" | "USDT",
			recipient: data.walletAddress,
		});
	};

	const handleClaimBalance = () => {
		claimBalanceMutation.mutate();
	};

	const handleCancelWithdrawal = () => {
		setIsWithdrawalModalOpen(false);
		setSelectedBalance(null);
		reset();
	};

	return (
		<div className="bg-white rounded-lg border-surface-border shadow-sm p-6 mb-6">
			<h3 className="text-lg font-semibold text-gray-800 mb-4">
				{t("user_balances")}
			</h3>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{balanceItems.map((item) => (
					<button
						key={item.symbol}
						type="button"
						onClick={() => handleBalanceClick(item)}
						className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
					</button>
				))}
			</div>

			{/* Claim Balance Section */}
			{balances.claimBalance !== undefined && (
				<div className="mt-6 pt-6 border-t border-gray-200">
					<h4 className="text-lg font-semibold text-gray-800 mb-4">
						{t("claim_balance")}
					</h4>
					<div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
						<div className="flex items-center space-x-3">
							<div className="relative w-10 h-10">
								<Image
									src="/images/balances/usd-coin-usdc-logo.svg"
									alt="USDC icon"
									fill
									className="object-contain rounded-full"
								/>
							</div>
							<div>
								<p className="text-lg font-bold text-green-800">
									{balances.claimBalance.toLocaleString()} USDC
								</p>
								<p className="text-sm text-green-600">{t("available_to_claim")}</p>
							</div>
						</div>
						<button
							type="button"
							disabled={balances.claimBalance === undefined || balances.claimBalance === 0 || claimBalanceMutation.isPending}
							onClick={() => handleClaimBalance()}
							className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							{claimBalanceMutation.isPending ? t("claiming") : t("claim")}
						</button>
					</div>
				</div>
			)}

			{/* Withdrawal Modal */}
			<Modal
				isOpen={isWithdrawalModalOpen}
				onClose={handleCancelWithdrawal}
				title={`${t("withdraw")} ${selectedBalance?.symbol}`}
			>
				<form onSubmit={handleSubmit(handleWithdraw)} className="space-y-4">
					<div className="mb-4 p-3 bg-gray-50 rounded-lg">
						<p className="text-sm text-gray-600 mb-1">{t("available_balance")}</p>
						<p className="text-lg font-semibold text-gray-800">
							{selectedBalance?.value.toLocaleString()} {selectedBalance?.symbol}
						</p>
					</div>
					
					<InputField
						name="walletAddress"
						control={control}
						label=""
						placeholder={t("enter_destination_wallet_address")}
						className="mb-4"
					/>
					
					{/* Show validation error if wallet address is invalid */}
					{walletAddress && !isValidWalletAddress && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">
								{t("invalid_wallet_address_message")}
							</p>
						</div>
					)}
					
					<div className="flex space-x-3">
						<Button
							type="button"
							variant="secondary"
							onClick={handleCancelWithdrawal}
							className="flex-1"
							disabled={withdrawTokenMutation.isPending}
						>
							{t("cancel")}
						</Button>
						<Button
							type="submit"
							variant="primary"
							className="flex-1"
							disabled={!isValidWalletAddress || withdrawTokenMutation.isPending}
						>
							{withdrawTokenMutation.isPending ? t("processing") : t("withdraw")}
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
