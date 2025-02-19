"use client";

import { PageHeader } from "@repo/ui/pageHeader";
import { useDisconnect } from "@starknet-react/core";
import { useAtom } from "jotai";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cartItemsAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";

interface HeaderProps {
	showCart?: boolean;
	profileOptions?: React.ReactNode;
	address?: string;
	disconnect?: () => void;
	onConnect?: () => void;
}

function Header({
	showCart,
	profileOptions,
	address,
	disconnect,
	onConnect,
}: HeaderProps) {
	const router = useRouter();
	const { t } = useTranslation();
	const { data: session } = useSession();
	const [items, setItems] = useAtom(cartItemsAtom);
	const utils = api.useUtils();

	const { mutate: removeFromCart } = api.cart.removeFromCart.useMutation({
		onSuccess: () => {
			void utils.cart.getUserCart.invalidate();
		},
	});

	const handleLogout = async () => {
		// Disconnect Starknet wallet if available
		if (disconnect) {
			disconnect();
		}
		// Sign out from the session
		await signOut();
		// Clear cart data
		setItems([]);
		// Redirect to home
		router.push("/");
	};

	const handleSignIn = () => {
		router.push("/auth/signin");
	};

	const handleRemoveFromCart = (cartItemId: string) => {
		removeFromCart({ cartItemId });
		// Also update local state
		setItems(items.filter((item) => item.id !== cartItemId));
	};

	// Transform cart items to match the expected type
	const transformedItems = items.map((item) => ({
		id: item.id,
		product: {
			name: item.name,
			price: item.price,
			nftMetadata: JSON.stringify({ imageUrl: item.imageUrl }),
		},
		quantity: item.quantity,
	}));

	return (
		<PageHeader
			title="CofiBlocks"
			userEmail={session?.user?.email}
			onLogout={handleLogout}
			onSignIn={handleSignIn}
			showCart={showCart}
			cartItems={transformedItems}
			onRemoveFromCart={handleRemoveFromCart}
			cartTranslations={{
				cartEmptyMessage: t("cart_empty_message"),
				quantityLabel: t("quantity_label"),
				removeConfirmationTitle: t("remove_confirmation_title"),
				removeConfirmationYes: t("remove_confirmation_yes"),
				cancel: t("cancel"),
			}}
			isAuthenticated={!!session}
			profileOptions={profileOptions}
		/>
	);
}

export default Header;
