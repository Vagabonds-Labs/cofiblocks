"use client";

import { useAccount, useDisconnect } from "@starknet-react/core";
import { useState } from "react";
import ProductDetails from "~/app/_components/features/ProductDetails";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import WalletConnect from "~/app/_components/features/WalletConnect";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";

export default function ProductPage() {
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

	const handleConnect = () => {
		setIsWalletModalOpen(true);
	};

	const handleCloseWalletModal = () => {
		setIsWalletModalOpen(false);
	};

	// Mock product data - in real app, this would come from an API
	const product = {
		id: 1,
		tokenId: 1,
		image: "/images/cafe1.webp",
		name: "Café de Especialidad",
		farmName: "Finca La Esperanza",
		roastLevel: "Medium",
		bagsAvailable: 10,
		price: 25.0,
		type: "Buyer" as const,
		process: "Natural",
		description: "Un café excepcional con notas a chocolate y frutos rojos.",
		region: "Huehuetenango",
	};

	return (
		<Main>
			<div className="flex flex-col min-h-screen">
				<Header
					address={address}
					disconnect={disconnect}
					showCart={true}
					onConnect={handleConnect}
					profileOptions={
						address ? <ProfileOptions address={address} /> : undefined
					}
				/>
				<div className="flex-grow px-4 md:px-6 lg:px-8 pt-24">
					<ProductDetails
						product={product}
						isConnected={!!address}
						onConnect={handleConnect}
					/>
				</div>

				<WalletConnect
					isOpen={isWalletModalOpen}
					onClose={handleCloseWalletModal}
					onSuccess={handleCloseWalletModal}
				/>
			</div>
		</Main>
	);
}
