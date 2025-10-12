"use client";

import { PageHeader } from "@repo/ui/pageHeader";
import { useAtom } from "jotai";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import { cartItemsAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";

interface HeaderProps {
	showCart?: boolean;
	profileOptions?: React.ReactNode;
	onConnect?: () => void;
}

interface ProductMetadata {
	imageUrl: string;
	description?: string;
}

function Header({
	showCart,
	profileOptions,
	onConnect: _onConnect,
}: HeaderProps) {
	const router = useRouter();
	const { t } = useTranslation();
	const { data, status } = useSession();
	const _user = data?.user;
	const isAuthenticated = status === "authenticated";
	const utils = api.useUtils();
	const [, setItems] = useAtom(cartItemsAtom);

	// Fetch cart data with proper caching
	const { data: cartData } = api.cart.getUserCart.useQuery(undefined, {
		enabled: isAuthenticated,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		retry: 3,
	});

	// Keep local state in sync with server data
	React.useEffect(() => {
		if (cartData?.items) {
			const transformedItems = cartData.items.map(
				(item: {
					id: string;
					product: {
						name: string;
						price: number;
						tokenId: number;
						nftMetadata: unknown;
					};
					quantity: number;
					is_grounded: boolean;
				}) => {
					let metadata: ProductMetadata;
					try {
						metadata = JSON.parse(
							typeof item.product.nftMetadata === "string"
								? item.product.nftMetadata
								: "{}",
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
						is_grounded: item.is_grounded,
					};
				},
			);
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
						(item: { id: string }) => item.id !== removedItem.cartItemId,
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

	const handleLogout = () => {
		// Sign out using Cavos auth
		void signOut();
		// Clear cart data
		setItems([]);
		// Redirect to home
		router.push("/");
	};

	const handleSignIn = () => {
		router.push("/auth");
	};

	const handleRemoveFromCart = (cartItemId: string) => {
		removeFromCart({ cartItemId });
	};

	// Transform cart items to match the expected type
	const transformedItems =
		cartData?.items.map(
			(item: {
				id: string;
				product: { name: string; price: number; nftMetadata: unknown };
				quantity: number;
				is_grounded: boolean;
			}) => {
				let metadata: ProductMetadata;
				try {
					metadata = JSON.parse(
						typeof item.product.nftMetadata === "string"
							? item.product.nftMetadata
							: "{}",
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
					is_grounded: item.is_grounded,
				};
			},
		) ?? [];

	// If no profile options are provided but user is authenticated, create default options
	const effectiveProfileOptions =
		profileOptions ??
		(isAuthenticated ? (
			<>
				{/* Use ProfileOptions component to show menu items */}
				<ProfileOptions />
			</>
		) : undefined);

	return (
		<PageHeader
			title="CofiBlocks"
			onLogout={handleLogout}
			onSignIn={handleSignIn}
			showCart={showCart}
			cartItems={transformedItems}
			onRemoveFromCart={handleRemoveFromCart}
			cartTranslations={{
				cartEmptyMessage: t("cart.empty_message"),
				quantityLabel: t("cart.quantity_label"),
				removeConfirmationTitle: t("cart.remove_confirmation_title"),
				removeConfirmationYes: t("cart.remove_confirmation_yes"),
				cancel: t("cart.cancel"),
			}}
			isAuthenticated={isAuthenticated}
			profileOptions={effectiveProfileOptions}
		/>
	);
}

export default Header;
