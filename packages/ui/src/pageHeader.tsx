"use client";

import {
	Bars3Icon,
	ChevronLeftIcon,
	ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./button";
import { CartContent } from "./cartContent";
import { CartSidebar } from "./cartSidebar";
import IconButton from "./iconButton";
import { Sidebar } from "./sidebar";

interface CartItem {
	id: string;
	product: {
		name: string;
		price: number;
		nftMetadata: string;
	};
	quantity: number;
}

interface PageHeaderProps {
	title: string;
	showCart?: boolean;
	cartItems?: CartItem[];
	onRemoveFromCart?: (cartItemId: string) => void;
	cartTranslations?: {
		cartEmptyMessage: string;
		quantityLabel: string;
		removeConfirmationTitle?: string;
		removeConfirmationYes?: string;
		cancel?: string;
	};
	profileOptions?: React.ReactNode;
	showBackButton?: boolean;
	onBackClick?: () => void;
	rightActions?: React.ReactNode;
	isAuthenticated?: boolean;
}

export function PageHeader({
	title,
	showCart,
	cartItems = [],
	onRemoveFromCart,
	cartTranslations,
	profileOptions,
	showBackButton,
	onBackClick,
	rightActions,
	isAuthenticated,
}: PageHeaderProps) {
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const router = useRouter();

	const cartItemsCount = cartItems.reduce(
		(total, item) => total + item.quantity,
		0,
	);
	const totalPrice = cartItems.reduce(
		(total, item) => total + item.product.price * item.quantity,
		0,
	);

	const handleCheckout = () => {
		setIsCartOpen(false);
		router.push("/checkout");
	};

	return (
		<header className="bg-white">
			<div className="mx-auto flex max-w-7xl items-center justify-between p-4">
				<div className="flex items-center gap-2">
					{showBackButton && (
						<IconButton
							icon={<ChevronLeftIcon className="w-6 h-6" />}
							onClick={onBackClick}
							variant="primary"
							size="lg"
							className="p-2 hover:bg-gray-100 rounded-full transition-colors !bg-transparent !text-content-body-default !border-0"
							aria-label="Go back"
						/>
					)}
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/images/logo.png"
							alt="Logo"
							width={40}
							height={64}
							className="w-10 h-16"
						/>
					</Link>
				</div>

				<div className="flex items-center gap-4">
					{showCart && (
						<button
							type="button"
							onClick={() => setIsCartOpen(true)}
							className="relative p-3 hover:bg-surface-primary-soft rounded-full transition-colors"
							aria-label="Shopping cart"
						>
							<ShoppingCartIcon className="w-6 h-6 text-content-body-default" />
							{cartItemsCount > 0 && (
								<span className="absolute -right-1 -top-1 rounded-full bg-error-default px-2 py-1 text-xs text-surface-inverse min-w-[20px] h-5 flex items-center justify-center">
									{cartItemsCount}
								</span>
							)}
						</button>
					)}

					{isAuthenticated ? (
						<>
							<button
								type="button"
								onClick={() => setIsMenuOpen(true)}
								className="p-3 hover:bg-surface-primary-soft rounded-full transition-colors"
								aria-label="Menu"
							>
								<Bars3Icon className="w-6 h-6 text-content-body-default" />
							</button>
							<Sidebar
								isOpen={isMenuOpen}
								onClose={() => setIsMenuOpen(false)}
								title="Menu"
							>
								{profileOptions}
							</Sidebar>
						</>
					) : (
						rightActions
					)}

					<CartSidebar
						isOpen={isCartOpen}
						onClose={() => setIsCartOpen(false)}
						title="Shopping Cart"
						totalPrice={totalPrice}
						onCheckout={handleCheckout}
					>
						<CartContent
							items={cartItems}
							onRemoveItem={onRemoveFromCart}
							translations={cartTranslations}
						/>
					</CartSidebar>
				</div>
			</div>
		</header>
	);
}

export default PageHeader;
