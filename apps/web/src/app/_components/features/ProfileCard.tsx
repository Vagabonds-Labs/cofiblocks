import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslation } from "react-i18next";

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
	badges: Badge[];
};

type ProfileCardProps = {
	user: UserProfile;
};

function ProfileCard({ user }: ProfileCardProps) {
	const { t } = useTranslation();

	// Define all badges and their translation keys
	const allBadges: Badge[] = ["lover", "contributor", "producer"];

	// Format country name for display
	const formattedCountry = user.country.replace("_", " ");

	return (
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
				{allBadges.map((badge) => (
					<div key={badge} className="flex flex-col items-center">
						<Image
							src={`/images/user-profile/badges/${badge}.svg`}
							alt={badge}
							width={32}
							height={32}
							className={`${
								user.badges.includes(badge) ? "" : "grayscale"
							} mb-1 sm:w-[40px] sm:h-[40px]`}
						/>
						{/* Translate the badge name */}
						<p className="text-xs sm:text-sm">{t(badge)}</p>
					</div>
				))}
			</div>
		</div>
	);
}

export { ProfileCard };
