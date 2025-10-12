"use client";

import Carousel from "@repo/ui/carousel";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProductCatalog from "~/app/_components/features/ProductCatalog";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import SearchBar from "../_components/features/SearchBar";
import { useSession } from "next-auth/react";

export default function Home() {
	const { t } = useTranslation();
	const [_isWalletModalOpen, setIsWalletModalOpen] = useState(false);
	const { data: session } = useSession();
	const user = session?.user;
	const isAuthenticated = !!user;

	const handleConnect = () => {
		setIsWalletModalOpen(true);
	};

	const _handleCloseWalletModal = () => {
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
					showCart={isAuthenticated}
					onConnect={handleConnect}
					profileOptions={<ProfileOptions/>}
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
						<ProductCatalog />
					</div>
				</div>
			</div>
		</Main>
	);
}
