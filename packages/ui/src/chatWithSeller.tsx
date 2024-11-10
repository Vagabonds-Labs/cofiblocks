import Image from "next/image";

interface ChatWithSellerProps {
	name: string;
	description: string;
	avatarSrc?: string;
	onClick?: () => void;
}

export function ChatWithSeller({
	name,
	description,
	avatarSrc = "/images/user-profile/avatar.svg",
	onClick,
}: ChatWithSellerProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full px-4 py-3 bg-white flex justify-between items-center"
		>
			<div className="flex items-center gap-4">
				<div className="relative">
					<Image
						width={40}
						height={40}
						className="rounded-2xl"
						src={avatarSrc}
						alt="Seller avatar"
					/>
					<div className="absolute bottom-0 right-0 w-2 h-2 bg-[#067C6D] rounded-full border border-white" />
				</div>
				<div className="flex flex-col items-start">
					<span className="text-content-title font-semibold text-base">
						{name}
					</span>
					<span className="text-content-body-default text-sm">
						{description}
					</span>
				</div>
			</div>
			<div className="text-content-title">
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					role="img"
					aria-label="Navigate to chat"
				>
					<title>Navigate to chat</title>
					<path
						d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"
						fill="currentColor"
					/>
				</svg>
			</div>
		</button>
	);
}
