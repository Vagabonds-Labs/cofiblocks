"use client";

import Carousel from "@repo/ui/carousel";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useState } from "react";
import ProductCatalog from "~/app/_components/features/ProductCatalog";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import WalletConnect from "~/app/_components/features/WalletConnect";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { searchQueryAtom } from "~/atoms/productAtom";
import { useTranslation } from "~/i18n";
import SearchBar from "../_components/features/SearchBar";

export default function Home() {
	const { t } = useTranslation();
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

	const handleConnect = () => {
		setIsWalletModalOpen(true);
	};

	const handleCloseWalletModal = () => {
		setIsWalletModalOpen(false);
	};

	const carouselData = [
		{
			id: "1",
			tag: t("tag_new"),
			title: t("welcome_coffee_lover"),
			image: "/images/carousel1.webp",
		},
		{
			id: "2",
			tag: t("featured"),
			title: t("find_best_coffee"),
			image: "/images/carousel2.webp",
		},
		{
			id: "3",
			tag: t("popular"),
			title: t("discover_unique_blends"),
			image: "/images/carousel3.webp",
		},
	];

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
				<div className="flex-grow">
					{/* Hero Section */}
					<div className="mb-8">
						<Carousel cards={carouselData} />
					</div>

					{/* Search Section */}
					<div className="mb-12 px-4 md:px-6 lg:px-8">
						<SearchBar />
					</div>

					{/* Product Catalog */}
					<div className="px-4 md:px-6 lg:px-8">
						<ProductCatalog isConnected={!!address} onConnect={handleConnect} />
					</div>
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
