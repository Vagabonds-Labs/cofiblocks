"use client";

import PageHeader from "@repo/ui/pageHeader";
import { useAtomValue } from "jotai";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cartItemsAtom } from "~/store/cartAtom";

interface HeaderProps {
	address: string | undefined;
	disconnect: () => void;
	showCart?: boolean;
	onConnect?: () => void;
}

function Header({ address, disconnect, showCart, onConnect }: HeaderProps) {
	const router = useRouter();
	const items = useAtomValue(cartItemsAtom);
	const cartItemsCount = showCart
		? items.reduce((total, item) => total + item.quantity, 0)
		: undefined;

	const handleLogout = async () => {
		await signOut();
		disconnect();
		router.push("/");
	};

	return (
		<PageHeader
			title="CofiBlocks"
			userAddress={address}
			onLogout={handleLogout}
			showCart={showCart}
			cartItemsCount={cartItemsCount}
			onConnect={onConnect}
		/>
	);
}

export default Header;
