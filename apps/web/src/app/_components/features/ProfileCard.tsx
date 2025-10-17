import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatWalletAddress } from "~/utils/formatting";

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
				<div className="bg-surface-primary-soft py-4 sm:py-6 px-4 sm:px-6 flex justify-around rounded-b-lg">
					{badges.map(({ type, active }) => (
						<div key={type} className="flex flex-col items-center">
							<Image
								src={`/images/user-profile/badges/${type}.svg`}
								alt={type}
								width={32}
								height={32}
								className={`${active ? "" : "grayscale opacity-50"} mb-1 sm:w-[40px] sm:h-[40px]`}
							/>
							<p
								className={`text-xs sm:text-sm ${active ? "" : "text-gray-400"}`}
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
								{t("wallet.address")}
							</h3>
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
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export { ProfileCard };
