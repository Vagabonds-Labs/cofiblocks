"use client";

import { CubeTransparentIcon, WalletIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
// import Button from "../ui/Button";
import { Button } from "@repo/ui/button";
import type { ConnectVariables, Connector } from "@starknet-react/core";
import dynamic from "next/dynamic";
import { useState } from "react";
import ShoppingCart from "~/app/_components/features/ShoppingCart";

const BlockiesSvg = dynamic(() => import("blockies-react-svg"), { ssr: false });

interface HeaderProps {
	address: string | undefined;
	connect: (args?: ConnectVariables | undefined) => void;
	connectors: Connector[];
	disconnect: () => void;
	cartItems?: number;
}

export default function Header({
	address,
	connect,
	connectors,
	disconnect,
	cartItems = 0,
}: HeaderProps) {
	const [isCartOpen, setIsCartOpen] = useState(false);

	return (
		<header className="flex items-center justify-between bg-gradient-to-r from-primary to-secondary p-4 shadow-lg">
			<div className="flex items-center space-x-2">
				<CubeTransparentIcon className="h-8 w-8 text-white" />
				<div className="text-xl font-bold text-white">CofiBlocks ☕️</div>
			</div>
			<div className="relative flex items-center gap-4">
				{cartItems > 0 && (
					<div className="absolute left-4 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
						{cartItems}
					</div>
				)}
				<ShoppingCartIcon
					onClick={() => setIsCartOpen(!isCartOpen)}
					className="h-6 w-6 cursor-pointer text-white hover:text-accent transition-colors"
				/>
				{isCartOpen && <ShoppingCart closeCart={() => setIsCartOpen(false)} />}
				{!address ? (
					<ul className="flex gap-2">
						{connectors.map((connector) => (
							<li key={connector.id}>
								<Button onClick={() => connect({ connector })}>
									<div className="flex items-center space-x-2">
										<WalletIcon className="h-5 w-5" />
										<span>Connect</span>
									</div>
								</Button>
							</li>
						))}
					</ul>
				) : (
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full py-2 px-4">
							<div className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
								<BlockiesSvg address={address} size={8} scale={4} />
							</div>
							<span className="text-white text-sm font-medium truncate w-24">
								{`${address.slice(0, 6)}...${address.slice(-4)}`}
							</span>
						</div>
						<Button onClick={disconnect}>Disconnect</Button>
					</div>
				)}
			</div>
		</header>
	);
}
