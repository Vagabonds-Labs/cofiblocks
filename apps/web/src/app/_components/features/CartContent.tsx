"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { Text } from "@repo/ui/typography";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";

export default function CartContent() {
	const { t } = useTranslation();
	const { data: cart, refetch: refetchCart } = api.cart.getUserCart.useQuery();
	const { mutate: removeFromCart } = api.cart.removeFromCart.useMutation({
		onSuccess: () => {
			void refetchCart();
		},
	});

	const handleRemove = (cartItemId: string) => {
		removeFromCart({ cartItemId });
	};

	const getImageUrl = (nftMetadata: unknown): string => {
		if (typeof nftMetadata !== "string") return "/images/default.webp";
		try {
			const metadata = JSON.parse(nftMetadata) as { imageUrl: string };
			return metadata.imageUrl;
		} catch {
			return "/images/default.webp";
		}
	};

	if (!cart?.items || cart.items.length === 0) {
		return (
			<div className="py-8 text-center text-gray-500">
				{t("cart_empty_message")}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{cart.items.map((item) => (
				<div
					key={item.id}
					className="py-4 flex items-center justify-between border-b"
				>
					<div className="flex items-center gap-3">
						<Image
							src={getImageUrl(item.product.nftMetadata)}
							alt={item.product.name}
							width={48}
							height={48}
							className="rounded-lg object-cover bg-gray-100"
						/>
						<div>
							<Text className="font-medium text-gray-900">
								{t(item.product.name)}
							</Text>
							<Text className="text-gray-400 text-sm">
								{t("quantity_label")}: {item.quantity}
							</Text>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-gray-900">
							{item.product.price * item.quantity} USD
						</span>
						<button
							type="button"
							onClick={() => handleRemove(item.id)}
							className="text-red-500 hover:text-red-600"
							aria-label={`Remove ${item.product.name} from cart`}
						>
							<TrashIcon className="h-5 w-5" />
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
