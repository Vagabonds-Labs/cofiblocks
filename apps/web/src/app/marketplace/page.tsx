"use client";

import Carousel from "@repo/ui/carousel";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useTranslation } from "react-i18next";
import ProductCatalog from "~/app/_components/features/ProductCatalog";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";

export default function Home() {
	const { t } = useTranslation();
	const { address } = useAccount();
	const { disconnect } = useDisconnect();

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
			<Header address={address} disconnect={disconnect} />
			<Carousel cards={carouselData} />
			<ProductCatalog />
		</Main>
	);
}
