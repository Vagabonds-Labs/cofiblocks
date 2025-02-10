import Image from "next/image";
import { useTranslation } from "~/i18n";

type Badge = "lover" | "contributor" | "producer";

type UserProfile = {
	name: string;
	country: string;
	memberSince: number;
	thumbnailUrl: string;
	badges: Badge[];
};

type ProfileCardProps = {
	user: UserProfile;
};

function ProfileCard({ user }: ProfileCardProps) {
	const { t } = useTranslation();

	// Define all badges and their translation keys
	const allBadges: Badge[] = ["lover", "contributor", "producer"];

	return (
		<div className="overflow-hidden mb-6 bg-[url('/images/user-profile/bg-coffee-beans.svg')] pt-9 bg-repeat-y bg-top">
			<div className="h-30 relative rounded-t-lg">
				<div className="absolute inset-0 bg-surface-primary-default/90 rounded-t-lg" />
				<div className="relative z-10 h-full p-6 flex items-center justify-center text-surface-inverse">
					<Image
						src={user.thumbnailUrl}
						alt={user.name}
						width={80}
						height={80}
						className="rounded-full mr-8"
					/>
					<div className="flex flex-col space-y-2">
						<h2 className="text-2xl font-semibold h-[1.875rem]">{user.name}</h2>
						<p className="h-5">{user.country}</p>
						<p className="h-5">
							{t("since")} {user.memberSince}
						</p>
					</div>
				</div>
			</div>
			<div className="bg-surface-primary-soft py-6 px-6 flex justify-around rounded-b-lg">
				{allBadges.map((badge) => (
					<div key={badge} className="flex flex-col items-center">
						<Image
							src={`/images/user-profile/badges/${badge}.svg`}
							alt={badge}
							width={40}
							height={40}
							className={`${
								user.badges.includes(badge) ? "" : "grayscale"
							} mb-1`}
						/>
						{/* Translate the badge name */}
						<p className="text-sm">{t(badge)}</p>
					</div>
				))}
			</div>
		</div>
	);
}

export { ProfileCard };
