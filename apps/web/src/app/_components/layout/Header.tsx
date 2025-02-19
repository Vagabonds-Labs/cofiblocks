"use client";

import { PageHeader } from "@repo/ui/pageHeader";
import { useDisconnect } from "@starknet-react/core";
import { useAtom } from "jotai";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";
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

interface ProductMetadata {
	imageUrl: string;
	description?: string;
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
	const utils = api.useUtils();
	const [, setItems] = useAtom(cartItemsAtom);

	// Fetch cart data with proper caching
	const { data: cartData } = api.cart.getUserCart.useQuery(undefined, {
		enabled: !!session,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		retry: 3,
	});

	// Keep local state in sync with server data
	React.useEffect(() => {
		if (cartData?.items) {
			const transformedItems = cartData.items.map((item) => {
				let metadata: ProductMetadata;
				try {
					metadata = JSON.parse(
						item.product.nftMetadata as string,
					) as ProductMetadata;
				} catch (e) {
					console.error("Failed to parse product metadata:", e);
					metadata = { imageUrl: "/default-image.webp" };
				}

				return {
					id: item.id,
					tokenId: item.product.tokenId,
					name: item.product.name,
					quantity: item.quantity,
					price: item.product.price,
					imageUrl: metadata.imageUrl ?? "/default-image.webp",
				};
			});
			setItems(transformedItems);
		} else {
			setItems([]);
		}
	}, [cartData, setItems]);

	// Remove from cart mutation with optimistic updates
	const { mutate: removeFromCart } = api.cart.removeFromCart.useMutation({
		onMutate: async (removedItem) => {
			await utils.cart.getUserCart.cancel();
			const previousCart = utils.cart.getUserCart.getData();

			if (previousCart) {
				utils.cart.getUserCart.setData(undefined, {
					...previousCart,
					items: previousCart.items.filter(
						(item) => item.id !== removedItem.cartItemId,
					),
				});
			}

			return { previousCart };
		},
		onError: (err, variables, context) => {
			if (context?.previousCart) {
				utils.cart.getUserCart.setData(undefined, context.previousCart);
			}
			toast.error(err.message ?? t("error_removing_from_cart"));
		},
		onSettled: () => {
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
	};

	// Transform cart items to match the expected type
	const transformedItems =
		cartData?.items.map((item) => {
			let metadata: ProductMetadata;
			try {
				metadata = JSON.parse(
					item.product.nftMetadata as string,
				) as ProductMetadata;
			} catch (e) {
				console.error("Failed to parse product metadata:", e);
				metadata = { imageUrl: "/default-image.webp" };
			}

			return {
				id: item.id,
				product: {
					name: item.product.name,
					price: item.product.price,
					nftMetadata: JSON.stringify({
						imageUrl: metadata.imageUrl ?? "/default-image.webp",
					}),
				},
				quantity: item.quantity,
			};
		}) ?? [];

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
