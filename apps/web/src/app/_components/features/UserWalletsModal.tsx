import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import BottomModal from "~/app/_components/ui/BottomModal";

interface UserWalletsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface Wallet {
	name: string;
	description: string;
	thumbnail: string;
}

function UserWalletsModal({ isOpen, onClose }: UserWalletsModalProps) {
	const [wallets, setWallets] = useState<Wallet[]>([]);

	useEffect(() => {
		// TODO: Implement wallet fetching logic
		setWallets([
			{
				name: "Argent",
				description: "Starknet explore",
				thumbnail: "/images/user-profile/argent-thumbnail.svg",
			},
		]);
	}, []);

	const handleOnWalletClick = () => {
		// TODO: Implement on wallet click logic
		alert("Implement on wallet click logic");
		onClose();
	};

	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			<h3 className="text-xl font-semibold mb-4 text-content-title text-center">
				Wallets
			</h3>
			<div className="flex flex-col gap-2">
				{wallets.map((wallet, index) => (
					<div
						key={wallet.name}
						className="flex justify-between items-center py-2 cursor-pointer"
						onClick={handleOnWalletClick}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								handleOnWalletClick();
							}
						}}
						role="button"
						tabIndex={0}
					>
						<div className="flex items-center justify-between w-full mt-2">
							<img
								src={wallet.thumbnail}
								alt="Wallet thumbnail"
								className="w-10 h-10 mr-5"
							/>
							<div className="flex-grow">
								<span className="text-lg font-bold">{wallet.name}</span>
								<p className="text-sm text-content-body-default">
									{wallet.description}
								</p>
							</div>
							<ChevronRightIcon className="w-6 h-6" />
						</div>
					</div>
				))}
			</div>
		</BottomModal>
	);
}

export { UserWalletsModal };
