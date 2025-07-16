"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Button from "@repo/ui/button";
import { PageHeader } from "@repo/ui/pageHeader";
import { useAtom } from "jotai";
import React from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import { cartItemsAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";

interface HeaderProps {
	showCart?: boolean;
	profileOptions?: React.ReactNode;
}

interface ProductMetadata {
	imageUrl: string;
	description?: string;
}

function Header({ showCart }: HeaderProps) {
	const { t } = useTranslation();
	const utils = api.useUtils();
	const [, setItems] = useAtom(cartItemsAtom);

	const { data: cartData } = api.cart.getUserCart.useQuery(undefined, {
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		retry: 3,
	});

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
		<>
			<SignedIn>
				<PageHeader
					title="CofiBlocks"
					showCart={showCart}
					cartItems={transformedItems}
					onRemoveFromCart={(cartItemId) => removeFromCart({ cartItemId })}
					cartTranslations={{
						cartEmptyMessage: t("cart.empty_message"),
						quantityLabel: t("cart.quantity_label"),
						removeConfirmationTitle: t("cart.remove_confirmation_title"),
						removeConfirmationYes: t("cart.remove_confirmation_yes"),
						cancel: t("cart.cancel"),
					}}
					profileOptions={<ProfileOptions />}
					isAuthenticated={true}
				/>
			</SignedIn>
			<SignedOut>
				<PageHeader
					title="CofiBlocks"
					showCart={showCart}
					cartItems={[]}
					onRemoveFromCart={() => {
						/* No-op */
					}}
					cartTranslations={{
						cartEmptyMessage: t("cart.empty_message"),
						quantityLabel: t("cart.quantity_label"),
						removeConfirmationTitle: t("cart.remove_confirmation_title"),
						removeConfirmationYes: t("cart.remove_confirmation_yes"),
						cancel: t("cart.cancel"),
					}}
					rightActions={
						<SignInButton mode="modal">
							<Button variant="primary" size="sm">
								Sign in
							</Button>
						</SignInButton>
					}
					isAuthenticated={false}
				/>
			</SignedOut>
		</>
	);
}

export default Header;
