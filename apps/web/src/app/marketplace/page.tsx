"use client";

import Carousel from "@repo/ui/carousel";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/nextjs";
import ProductCatalog from "~/app/_components/features/ProductCatalog";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import WalletConnect from "~/app/_components/features/WalletConnect";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import SearchBar from "../_components/features/SearchBar";
import type { UnsafeMetadata } from "~/types";

export default function Home() {
	const { t } = useTranslation();
	const { address } = useAccount();
	const router = useRouter();
	const { user } = useUser();
	const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

	useEffect(() => {
		// Check if user is signed in and has no wallet
		const metadata = user?.unsafeMetadata as UnsafeMetadata | undefined;
		if (user && !metadata?.wallet?.encryptedPrivateKey) {
			router.push("/onboarding");
		}
	}, [user, router]);

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
					showCart={true}
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
				/>
			</div>
		</Main>
	);
}
