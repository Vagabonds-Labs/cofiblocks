"use client";

import { useAccount, useDisconnect } from "@starknet-react/core";
import { useState } from "react";
import ProductDetails from "~/app/_components/features/ProductDetails";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import WalletConnect from "~/app/_components/features/WalletConnect";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { api } from "~/trpc/react";

interface ProductPageProps {
	params: {
		id: string;
	};
}

export default function ProductPage({ params }: ProductPageProps) {
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
	const productId = Number.parseInt(params.id, 10);

	const { data: product, isLoading } = api.product.getProductById.useQuery({
		id: productId,
	});

	const handleConnect = () => {
		setIsWalletModalOpen(true);
	};

	const handleCloseWalletModal = () => {
		setIsWalletModalOpen(false);
	};

	if (isLoading) {
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
						<div className="animate-pulse">
							<div className="h-96 bg-gray-200 rounded-lg mb-6" />
						</div>
					</div>
				</div>
			</Main>
		);
	}

	if (!product) {
		return null;
	}

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
