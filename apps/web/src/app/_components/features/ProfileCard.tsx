import { CheckIcon, ClipboardIcon, ArrowTopRightOnSquareIcon, KeyIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatWalletAddress } from "~/utils/formatting";
import Button from "@repo/ui/button";
import Modal from "@repo/ui/modal";
import { api } from "~/trpc/react";
import { BridgeWidgetModal } from "./BridgeWidgetModal";

const BlockiesSvg = dynamic<{ address: string; size: number; scale: number }>(
	() => import("blockies-react-svg"),
	{ ssr: false },
);

type Badge = "lover" | "contributor" | "producer";

type UserProfile = {
	name: string;
	country: string;
	memberSince: number;
	walletAddress: string;
	role: string;
};

type ProfileCardProps = {
	user: UserProfile;
};

function ProfileCard({ user }: ProfileCardProps) {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
	const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
	const [otp, setOtp] = useState("");
	const [privateKey, setPrivateKey] = useState<string | null>(null);
	const [otpError, setOtpError] = useState<string | null>(null);

	// Formats backend OTP error messages into user-friendly text
	function formatOtpErrorMessage(raw: unknown): string {
		const fallback = t("wallet.otp_verify_error") || "Invalid OTP. Please try again.";
		if (!raw) return fallback;
		
		// Safely convert raw to string
		let msg: string;
		if (typeof raw === "string") {
			msg = raw;
		} else if (typeof raw === "object" && raw !== null && "message" in raw) {
			const errorObj = raw as { message?: unknown };
			msg = typeof errorObj.message === "string" 
				? errorObj.message 
				: JSON.stringify(raw);
		} else {
			msg = JSON.stringify(raw);
		}
		
		// Try to extract JSON payload if present using RegExp.exec()
		const jsonRegex = /\{.*\}/;
		const jsonMatch = jsonRegex.exec(msg);
		if (jsonMatch?.[0]) {
			try {
				const parsed = JSON.parse(jsonMatch[0]) as { code?: string };
				if (parsed.code === "INVALID_OTP") {
					return t("wallet.invalid_or_expired_otp") || "Invalid or expired OTP. Please try again.";
				}
			} catch {
				// ignore JSON parse errors
			}
		}
		// Known phrases
		if (/invalid\s*or\s*expired\s*otp/i.test(msg) || /INVALID_OTP/i.test(msg)) {
			return t("wallet.invalid_or_expired_otp") || "Invalid or expired OTP. Please try again.";
		}
		return fallback;
	}

	const { data: onrampData, isLoading: isLoadingOnramp } = api.user.getOnrampLink.useQuery(
		undefined,
		{ enabled: !!user.walletAddress },
	);

	// Provide modal buttons only when private key is shown to avoid default + internal close buttons
	const modalButtons = privateKey
		? [
			{
				label: t("wallet.close") || "Close",
				onClick: () => {
					setIsExportModalOpen(false);
					setOtpStep("request");
					setOtp("");
					setPrivateKey(null);
					setOtpError(null);
				},
				variant: "primary" as const,
			},
		]
		: undefined;

	const requestOTPMutation = api.user.requestWalletExportOTP.useMutation({
		onSuccess: () => {
			setOtpStep("verify");
			setOtpError(null);
		},
		onError: (error) => {
			console.error("Error requesting OTP:", error);
			setOtpError(t("wallet.otp_request_error") || "Error requesting OTP. Please try again.");
		},
	});

	const verifyOTPMutation = api.user.verifyWalletExportOTP.useMutation({
		onSuccess: (data) => {
			setPrivateKey(data.data.private_key);
			setOtpError(null);
		},
		onError: (error) => {
			console.error("Error verifying OTP:", error);
			setOtpError(formatOtpErrorMessage(error));
		},
	});

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(formatWalletAddress(user.walletAddress));
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy wallet address:", err);
		}
	};

	// Define badges and their validation rules
	const badges: { type: Badge; active: boolean }[] = [
		{
			type: "lover",
			active: true, // Everyone gets this badge
		},
		{
			type: "contributor",
			active: user.role === "COFFEE_PRODUCER" || user.role === "ADMIN",
		},
		{
			type: "producer",
			active: user.role === "COFFEE_PRODUCER",
		},
	];

	// Format country name for display
	const formattedCountry = user.country.replace("_", " ");

	return (
		<div>
			<div className="overflow-hidden mb-6 bg-[url('/images/user-profile/bg-coffee-beans.svg')] pt-9 bg-repeat-y bg-top">
				<div className="relative rounded-t-lg">
					<div className="absolute inset-0 bg-surface-primary-default/90 rounded-t-lg" />
					<div className="relative z-10 p-4 sm:p-6 flex items-center justify-center text-surface-inverse">
						<div className="flex flex-col items-center space-y-4">
							{/* Blockie Avatar */}
							<div className="rounded-full overflow-hidden relative w-20 h-20 mb-2">
								<BlockiesSvg address={user.walletAddress} size={20} scale={4} />
							</div>
							<div className="flex flex-col items-center space-y-2">
								<h2 className="text-xl sm:text-2xl font-semibold h-[1.875rem]">
									{user.name}
								</h2>
								<p className="text-sm sm:text-base h-5 capitalize">
									{formattedCountry}
								</p>
								<p className="text-sm sm:text-base h-5">
									{t("since")} {user.memberSince}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="bg-surface-primary-soft py-4 sm:py-6 px-4 sm:px-6 flex justify-between sm:justify-around items-center rounded-b-lg gap-2">
					{badges.map(({ type, active }) => (
						<div key={type} className="flex flex-col items-center justify-center flex-1 min-w-0">
							<Image
								src={`/images/user-profile/badges/${type}.svg`}
								alt={type}
								width={32}
								height={32}
								className={`${active ? "" : "grayscale opacity-50"} mb-1 sm:w-[40px] sm:h-[40px] flex-shrink-0`}
							/>
							<p
								className={`text-xs sm:text-sm text-center ${active ? "" : "text-gray-400"} break-words px-1`}
							>
								{t(`badges.${type}`)}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* Wallet Card */}
			{user.walletAddress && (
				<div className="bg-surface-inverse rounded-lg border border-surface-border shadow-sm p-6 mb-6">
					<div className="flex items-start justify-between">
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-semibold text-content-title mb-3">
								{t("wallet.starknet_address")}
							</h3>
							
							{/* Warning text */}
							<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
								<p className="text-sm text-yellow-800">
									{t("wallet.fund_warning")}{" "}
									<span className="font-semibold">{t("wallet.fund_warning_bold")}</span>
								</p>
							</div>

							<div className="bg-surface-primary-soft rounded-lg p-4 border border-surface-border">
								<div className="flex items-center justify-between">
									<span className="text-sm text-content-body-default font-mono break-all pr-4">
										{formatWalletAddress(user.walletAddress)}
									</span>
									<button
										type="button"
										onClick={copyToClipboard}
										className="flex-shrink-0 p-2 rounded-lg bg-surface-secondary-default hover:bg-surface-secondary-focus transition-colors duration-200 flex items-center justify-center"
										title={copied ? t("wallet.copied") : t("wallet.copy")}
									>
										{copied ? (
											<CheckIcon className="h-4 w-4 text-success-default" />
										) : (
											<ClipboardIcon className="h-4 w-4 text-content-title" />
										)}
									</button>
								</div>
							</div>
							{copied && (
								<div className="mt-3 text-sm text-success-default font-medium flex items-center">
									<CheckIcon className="h-4 w-4 mr-1" />
									{t("wallet.copied_message")}
								</div>
							)}

							{/* Funding options */}
							<div className="mt-6 space-y-3">
								{/* Primary funding option - Card payment */}
								<Button
									variant="primary"
									size="lg"
									className="w-full justify-between items-start sm:items-center text-white shadow-md hover:shadow-lg transition-all min-h-[3rem]"
									onClick={() => {
										if (onrampData?.url) {
											window.open(onrampData.url, "_blank");
										}
									}}
									disabled={isLoadingOnramp || !onrampData?.url}
								>
									<span className="flex-1 text-left leading-tight font-semibold text-base sm:text-lg break-words pr-3">
										{t("wallet.fund_with_card")}
									</span>
									<ArrowTopRightOnSquareIcon className="h-5 w-5 flex-shrink-0 self-center sm:self-auto" />
								</Button>

								{/* Secondary funding option - Bridge */}
								<Button
									variant="secondary"
									size="lg"
									className="w-full justify-between items-start sm:items-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 min-h-[3rem]"
									onClick={() => {
										setIsBridgeModalOpen(true);
									}}
								>
									<span className="flex-1 text-left leading-tight font-medium text-base sm:text-lg break-words pr-3">
										{t("wallet.fund_from_other_blockchains")}
									</span>
									<ArrowTopRightOnSquareIcon className="h-5 w-5 flex-shrink-0 self-center sm:self-auto" />
								</Button>

								{/* Divider */}
								<div className="relative my-2">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-200" />
									</div>
									<div className="relative flex justify-center text-xs">
										<span className="px-2 bg-white text-gray-500">
											{t("wallet.or") || "or"}
										</span>
									</div>
								</div>

								{/* Tertiary action - Export wallet */}
								<Button
									variant="transparent"
									size="md"
									className="w-full justify-between text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200"
									onClick={() => {
										setIsExportModalOpen(true);
										setOtpStep("request");
										setOtp("");
										setPrivateKey(null);
									}}
								>
									<div className="flex items-center gap-2">
										<KeyIcon className="h-4 w-4" />
										<span className="text-sm">{t("wallet.export_wallet") || "Export Wallet"}</span>
									</div>
									<ArrowTopRightOnSquareIcon className="h-4 w-4 opacity-50" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Wallet Export Modal */}
			<Modal
				isOpen={isExportModalOpen}
				onClose={() => {
					setIsExportModalOpen(false);
					setOtpStep("request");
					setOtp("");
					setPrivateKey(null);
					setOtpError(null);
				}}
				title={t("wallet.export_wallet") || "Export Wallet"}
				buttons={modalButtons}
			>
				{otpStep === "request" && !privateKey && (
					<div className="space-y-4">
						<p className="text-sm text-content-body-default">
							{t("wallet.export_warning") || "To export your wallet, we'll send you an OTP via email. Please check your inbox."}
						</p>
						{otpError && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-800">{otpError}</p>
							</div>
						)}
						<Button
							variant="primary"
							className="w-full"
							onClick={() => {
								setOtpError(null);
								requestOTPMutation.mutate();
							}}
							disabled={requestOTPMutation.isPending}
						>
							{requestOTPMutation.isPending
								? t("wallet.sending_otp") || "Sending OTP..."
								: t("wallet.request_otp") || "Request OTP"}
						</Button>
					</div>
				)}

				{otpStep === "verify" && !privateKey && (
					<div className="space-y-4">
						<p className="text-sm text-content-body-default">
							{t("wallet.enter_otp") || "Please enter the OTP sent to your email address."}
						</p>
						{otpError && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-800">{otpError}</p>
							</div>
						)}
						<input
							type="text"
							value={otp}
							onChange={(e) => {
								setOtp(e.target.value);
								setOtpError(null);
							}}
							placeholder={t("wallet.otp_placeholder") || "Enter OTP"}
							className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
								otpError
									? "border-red-300 focus:ring-red-500"
									: "border-surface-border focus:ring-surface-secondary-default"
							}`}
							maxLength={6}
						/>
						<div className="flex space-x-3">
							<Button
								variant="secondary"
								className="flex-1"
								onClick={() => {
									setOtpStep("request");
									setOtp("");
									setOtpError(null);
								}}
							>
								{t("cancel")}
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								onClick={() => {
									setOtpError(null);
									verifyOTPMutation.mutate({ otp });
								}}
								disabled={!otp || otp.length !== 6 || verifyOTPMutation.isPending}
							>
								{verifyOTPMutation.isPending
									? t("wallet.verifying") || "Verifying..."
									: t("wallet.verify") || "Verify"}
							</Button>
						</div>
					</div>
				)}

				{privateKey && (
					<div className="space-y-4">
						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
							<p className="text-sm font-semibold text-yellow-800 mb-2">
								{t("wallet.warning") || "⚠️ Warning"}
							</p>
							<p className="text-xs text-yellow-800">
								{t("wallet.private_key_warning") || "Keep your private key secure and never share it with anyone. Anyone with access to this key can control your wallet."}
							</p>
						</div>
						<div className="bg-surface-primary-soft rounded-lg p-4 border border-surface-border">
							<label className="text-sm font-medium text-content-title mb-2 block">
								{t("wallet.private_key") || "Private Key"}
							</label>
							<div className="flex items-center justify-between">
								<span className="text-sm text-content-body-default font-mono break-all pr-4">
									{privateKey}
								</span>
								<button
									type="button"
									onClick={async () => {
										try {
											await navigator.clipboard.writeText(privateKey);
											alert(t("wallet.private_key_copied") || "Private key copied to clipboard!");
										} catch (err) {
											console.error("Failed to copy private key:", err);
										}
									}}
									className="flex-shrink-0 p-2 rounded-lg bg-surface-secondary-default hover:bg-surface-secondary-focus transition-colors duration-200 flex items-center justify-center"
									title={t("wallet.copy_private_key") || "Copy private key"}
								>
									<ClipboardIcon className="h-4 w-4 text-content-title" />
								</button>
							</div>
						</div>
					</div>
				)}
			</Modal>

			{/* Bridge Widget Modal */}
			{user.walletAddress && (
				<BridgeWidgetModal
					isOpen={isBridgeModalOpen}
					onClose={() => setIsBridgeModalOpen(false)}
					recipientAddress={user.walletAddress}
				/>
			)}
		</div>
	);
}

export { ProfileCard };
