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
	const [, setIsWalletModalOpen] = useState(false);
	const { data: session } = useSession();
	const user = session?.user;
	const isAuthenticated = !!user;

	const handleConnect = () => {
		setIsWalletModalOpen(true);
	};

	// const _handleCloseWalletModal = () => {
	// 	setIsWalletModalOpen(false);
	// };

	const carouselData = [
		{
			id: "1",
			tag: t("tag_new"),
			title: t("welcome_coffee_lover"),
			image: "/images/01.svg",
		},
		{
			id: "2",
			tag: t("featured"),
			title: t("find_best_coffee"),
			image: "/images/02.svg",
		},
		{
			id: "3",
			tag: t("popular"),
			title: t("discover_unique_blends"),
			image: "/images/03.svg",
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
				<div className="flex-grow mb-6">
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
